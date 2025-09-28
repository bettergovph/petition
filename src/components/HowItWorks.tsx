import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { CheckCircle, Globe, MapPin, Shield, Clock, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function HowItWorks() {
  const { t } = useTranslation('common')

  const steps = [
    {
      step: 1,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      image:
        'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      details: [
        t('howItWorks.step1.detail1'),
        t('howItWorks.step1.detail2'),
        t('howItWorks.step1.detail3'),
        t('howItWorks.step1.detail4'),
        t('howItWorks.step1.detail5'),
      ],
    },
    {
      step: 2,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      image:
        'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      details: [
        t('howItWorks.step2.detail1'),
        t('howItWorks.step2.detail2'),
        t('howItWorks.step2.detail3'),
        t('howItWorks.step2.detail4'),
        t('howItWorks.step2.detail5'),
      ],
    },
    {
      step: 3,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      image:
        'https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      details: [
        t('howItWorks.step3.detail1'),
        t('howItWorks.step3.detail2'),
        t('howItWorks.step3.detail3'),
        t('howItWorks.step3.detail4'),
        t('howItWorks.step3.detail5'),
      ],
    },
    {
      step: 4,
      title: t('howItWorks.step4.title'),
      description: t('howItWorks.step4.description'),
      image:
        'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      details: [
        t('howItWorks.step4.detail1'),
        t('howItWorks.step4.detail2'),
        t('howItWorks.step4.detail3'),
        t('howItWorks.step4.detail4'),
        t('howItWorks.step4.detail5'),
      ],
    },
  ]

  const features = [
    {
      icon: Globe,
      title: t('howItWorks.feature1.title'),
      description: t('howItWorks.feature1.description'),
    },
    {
      icon: Shield,
      title: t('howItWorks.feature2.title'),
      description: t('howItWorks.feature2.description'),
    },
    {
      icon: Clock,
      title: t('howItWorks.feature3.title'),
      description: t('howItWorks.feature3.description'),
    },
    {
      icon: TrendingUp,
      title: t('howItWorks.feature4.title'),
      description: t('howItWorks.feature4.description'),
    },
  ]

  const petitionTypes = [
    {
      type: t('howItWorks.localPetitions'),
      icon: MapPin,
      description: t('howItWorks.localDescription'),
      examples: [
        t('howItWorks.localExample1'),
        t('howItWorks.localExample2'),
        t('howItWorks.localExample3'),
        t('howItWorks.localExample4'),
        t('howItWorks.localExample5'),
      ],
      color: 'bg-green-50 border-green-200 text-green-800',
    },
    {
      type: t('howItWorks.nationalPetitions'),
      icon: Globe,
      description: t('howItWorks.nationalDescription'),
      examples: [
        t('howItWorks.nationalExample1'),
        t('howItWorks.nationalExample2'),
        t('howItWorks.nationalExample3'),
        t('howItWorks.nationalExample4'),
        t('howItWorks.nationalExample5'),
      ],
      color: 'bg-blue-50 border-blue-200 text-blue-800',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('howItWorks.title')}</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              {t('howItWorks.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create">
                <Button className="bg-white border border-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg transition-all duration-300 transform hover:scale-105">
                  {t('howItWorks.startPetition')}
                </Button>
              </Link>
              <Link to="/petitions">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg transition-all duration-300 transform hover:scale-105"
                >
                  {t('howItWorks.browsePetitions')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Steps Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('howItWorks.stepsTitle')}</h2>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              {t('howItWorks.stepsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {steps.map(step => (
              <div key={step.step} className="flex flex-col">
                {/* Image */}
                <div className="relative mb-6">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl overflow-hidden">
                    <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                  </div>
                  {/* Step Number Overlay */}
                  <div className="absolute -top-3 -left-3">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                      {step.step}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-800 mb-4 text-sm leading-relaxed">{step.description}</p>

                  <ul className="space-y-2">
                    {step.details.slice(0, 3).map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{detail}</span>
                      </li>
                    ))}
                    {step.details.length > 3 && (
                      <li className="text-gray-500 text-sm italic">
                        +{step.details.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Petition Types Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('howItWorks.typesTitle')}</h2>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              {t('howItWorks.typesSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {petitionTypes.map(type => (
              <Card key={type.type} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${type.color}`}
                    >
                      <type.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{type.type}</h3>
                  </div>

                  <p className="text-gray-800 mb-6">{type.description}</p>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {t('howItWorks.popularExamples')}
                    </h4>
                    <ul className="space-y-2">
                      {type.examples.map((example, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-gray-700">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('howItWorks.featuresTitle')}
            </h2>
            <p className="text-lg text-gray-800 max-w-2xl mx-auto">
              {t('howItWorks.featuresSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(feature => (
              <Card key={feature.title} className="text-center p-6">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-800 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                {t('howItWorks.tipsTitle')}
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('howItWorks.creatingTitle')}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip1')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip2')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip3')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip4')}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('howItWorks.promotingTitle')}
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip5')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip6')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip7')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{t('howItWorks.tip8')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA Section - Full Width */}
      <section className="relative bg-linear-to-r from-primary-600 to-primary-700 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('howItWorks.ctaTitle')}
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              {t('howItWorks.ctaSubtitle')}
            </p>

            {/* Enhanced buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/create">
                <Button className="group bg-white text-blue-600 hover:bg-gray-50 px-12 py-8 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                  <span className="flex items-center gap-3">
                    {t('howItWorks.createYourPetition')}
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </span>
                </Button>
              </Link>

              <div className="text-white/60 text-lg font-medium">or</div>

              <Link to="/petitions">
                <Button
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white px-10 py-8 text-lg font-medium rounded-2xl backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1"
                >
                  {t('howItWorks.exploreExistingPetitions')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave decoration */}
        {/* <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 text-gray-50" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div> */}
      </section>
    </div>
  )
}
