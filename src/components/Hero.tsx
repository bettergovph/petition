import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Hero() {
  const { t } = useTranslation('home')
  return (
    <section className="bg-linear-to-r from-primary-600 to-primary-700 text-white py-12 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-[Figtree]">{t('title')}</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-200">{t('subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button
                size="lg"
                className="bg-white border w-full border-white text-primary-600 hover:bg-gray-100 px-12 py-6 text-xl font-semibold rounded-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                Start a Petition
              </Button>
            </Link>
            <Link to="/petitions">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-primary-600 px-12 py-6 text-xl font-semibold rounded-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
              >
                Browse Petitions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
