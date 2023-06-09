import type { PageServerLoad, Actions } from './$types'
import { redirect, fail } from '@sveltejs/kit'
import { loginUser } from '$lib/api/auth'

export const load: PageServerLoad = (event) => {
  const user = event.locals.user

  if (user) {
    throw redirect(302, '/')
  }
}

export const actions: Actions = {
  default: async (event) => {
    const formData = Object.fromEntries(await event.request.formData())

    if (!formData.email || !formData.password) {
      return fail(400, {
        error: 'Missing email or password'
      })
    }

    const { email, password } = formData as { email: string; password: string }
    try {
      const token = (await loginUser(email, password)).access_token
      event.cookies.set('token', `Bearer ${token}`, {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 1 day
      })

    } catch (error) {
      console.error(error)
      throw redirect(302, '/login')
    }

    // Set the cookie

    throw redirect(302, '/')
  }
}
