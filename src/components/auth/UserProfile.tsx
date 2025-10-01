import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuthHook'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, LogOut } from 'lucide-react'

export default function UserProfile() {
  const { t } = useTranslation('common')
  const { session, status, signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session) {
    return null
  }

  const user = session.user

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="cursor-pointer flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {user.image ? (
          <img src={user.image} alt={user.name || 'User'} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-sm font-medium text-gray-900 hidden md:block">
          {user.name || 'User'}
        </span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
          <Card className="absolute right-0 top-full mt-2 w-56 z-20 shadow-lg border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="border-b border-gray-200 pb-3 mb-3">
                <p className="font-medium text-gray-900">{user.name || 'User'}</p>
              </div>
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <User className="w-4 h-4" />
                  {t('profile.myProfile')}
                </Link>
                <Button
                  onClick={signOut}
                  variant="outline"
                  className="w-full text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
