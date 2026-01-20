import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Define public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/', '/setup']
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname === route)

    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // RBAC: Role-Based Access Control
    if (user) {
        // 1. Fetch user roles
        const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)

        const userRoles = roles?.map(r => r.role) || []

        // 2. Define Route Permissions
        const routePermissions: Record<string, string[]> = {
            '/admin': ['ADMIN'],
            '/teacher': ['TEACHER'],
            '/homeroom': ['HOMEROOM'],
            '/counselor': ['COUNSELOR'],
            '/student': ['STUDENT'],
        }

        // 3. Determine user's primary dashboard (for redirects)
        const rolePriority = ['ADMIN', 'TEACHER', 'HOMEROOM', 'COUNSELOR', 'STUDENT']
        let primaryDashboard = '/login' // Default fallback

        for (const role of rolePriority) {
            if (userRoles.includes(role)) {
                if (role === 'ADMIN') primaryDashboard = '/admin'
                else if (role === 'TEACHER') primaryDashboard = '/teacher'
                else if (role === 'HOMEROOM') primaryDashboard = '/homeroom'
                else if (role === 'COUNSELOR') primaryDashboard = '/counselor'
                else if (role === 'STUDENT') primaryDashboard = '/student'
                break
            }
        }

        // 4. Redirect if accessing Auth pages while logged in
        if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
            const url = request.nextUrl.clone()
            url.pathname = primaryDashboard
            return NextResponse.redirect(url)
        }

        // 5. Check permissions for protected routes
        for (const [routePrefix, allowedRoles] of Object.entries(routePermissions)) {
            if (request.nextUrl.pathname.startsWith(routePrefix)) {
                const hasAccess = userRoles.some(role => allowedRoles.includes(role))
                if (!hasAccess) {
                    console.warn(`Unauthorized access attempt by ${user.email} to ${request.nextUrl.pathname}. Redirecting to ${primaryDashboard}`)
                    const url = request.nextUrl.clone()
                    url.pathname = primaryDashboard
                    return NextResponse.redirect(url)
                }
            }
        }
    }

    return supabaseResponse
}
