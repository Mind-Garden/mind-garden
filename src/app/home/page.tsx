import { redirect } from 'next/navigation'
import { logout } from "@/app/auth/actions";  

import { createClient } from '@/utils/supabase/server'
import DeleteAccount from '../components/DeleteAccount';

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    redirect('/error')
  }

  const userId = authData.user.id
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) {
    redirect('/error')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(/gradient.svg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-green-100 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-700 mb-4">Welcome, {profileData?.first_name} {profileData?.last_name}!</h1>
          <p className="text-gray-600 mb-8">Your email: {profileData?.email}</p>
        </div>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 ease-in-out"
        >
          Logout
        </button>
        <DeleteAccount userId={userId} />
      </div>
    </div>
  )
}