import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, Users, Shield, Scale } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <div className="flex items-center justify-center gap-2 text-lg text-blue-600 mb-2">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">Volunteer-Led Civic Project</span>
            </div>
            <p className="text-gray-800 max-w-2xl mx-auto">
              BetterGov.ph is a community-driven platform operated by volunteers dedicated to
              strengthening democratic participation in the Philippines.
            </p>
          </div>
        </div>

        {/* Volunteer Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Community-Driven Initiative
                </h3>
                <p className="text-blue-800">
                  This platform is maintained by volunteers who believe in the power of civic
                  engagement. We are not affiliated with any government agency, political party, or
                  commercial entity. Our mission is to provide a free, accessible space for
                  Filipinos to voice their concerns and advocate for positive change.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                By accessing and using BetterGov.ph ("the Platform"), you agree to be bound by these
                Terms of Service ("Terms"). If you do not agree to these Terms, please do not use
                the Platform.
              </p>
              <p className="text-gray-700">
                These Terms may be updated from time to time. We will notify users of significant
                changes through the Platform. Your continued use after such changes constitutes
                acceptance of the new Terms.
              </p>
              <p className="text-sm text-gray-800 italic">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </CardContent>
          </Card>

          {/* Platform Purpose */}
          <Card>
            <CardHeader>
              <CardTitle>2. Platform Purpose and Volunteer Nature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                BetterGov.ph is a volunteer-operated civic engagement platform designed to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  Enable Filipino citizens to create and sign petitions on issues of public concern
                </li>
                <li>Facilitate democratic participation and civic engagement</li>
                <li>Provide a free, accessible platform for community organizing</li>
                <li>Support transparency and accountability in governance</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">
                  <strong>Important:</strong> This platform is operated entirely by volunteers. We
                  do not guarantee petition outcomes, government responses, or any specific results.
                  The Platform serves as a tool for civic expression, not as a guarantee of policy
                  change.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card>
            <CardHeader>
              <CardTitle>3. User Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">When using the Platform, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and truthful information</li>
                <li>Use the Platform only for lawful purposes</li>
                <li>Respect the rights and dignity of others</li>
                <li>Not create petitions that promote hate speech, discrimination, or violence</li>
                <li>Not impersonate others or create fake accounts</li>
                <li>Not spam, harass, or abuse other users</li>
                <li>Comply with all applicable Philippine laws and regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Content Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>4. Content Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                All petitions and user content must adhere to our community standards:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Allowed Content</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Constructive policy proposals</li>
                    <li>• Community improvement initiatives</li>
                    <li>• Government accountability requests</li>
                    <li>• Social justice advocacy</li>
                    <li>• Environmental protection campaigns</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Prohibited Content</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Hate speech or discrimination</li>
                    <li>• Personal attacks or defamation</li>
                    <li>• False or misleading information</li>
                    <li>• Commercial advertisements</li>
                    <li>• Content violating Philippine law</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                5. Privacy and Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We are committed to protecting your privacy and complying with the Data Privacy Act
                of 2012:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>We collect only necessary information for platform functionality</li>
                <li>
                  Your personal data is never sold or shared with third parties for commercial
                  purposes
                </li>
                <li>
                  Petition signatures may be publicly visible as part of the democratic process
                </li>
                <li>You can request deletion of your account and associated data</li>
                <li>We use secure authentication through trusted providers (Google, Facebook)</li>
              </ul>
              <p className="text-sm text-gray-800">
                For detailed information about data handling, please review our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>6. Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Platform Limitations</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• We cannot guarantee petition delivery to intended recipients</li>
                  <li>• We do not control government or institutional responses</li>
                  <li>• Platform availability may be affected by technical issues</li>
                  <li>• Volunteer maintenance may result in occasional downtime</li>
                </ul>
              </div>
              <p className="text-gray-700">
                <strong>No Warranty:</strong> The Platform is provided "as is" without warranties of
                any kind. We make no guarantees about the effectiveness, accuracy, or reliability of
                the service.
              </p>
              <p className="text-gray-700">
                <strong>Limitation of Liability:</strong> Our volunteer operators shall not be
                liable for any indirect, incidental, or consequential damages arising from Platform
                use.
              </p>
            </CardContent>
          </Card>

          {/* Moderation */}
          <Card>
            <CardHeader>
              <CardTitle>7. Content Moderation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">Our volunteer moderators reserve the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Review and remove content that violates these Terms</li>
                <li>Suspend or terminate accounts for repeated violations</li>
                <li>Edit petition titles or descriptions for clarity (with user notification)</li>
                <li>Close petitions that become inactive or inappropriate</li>
              </ul>
              <p className="text-gray-700">
                We strive for fair and transparent moderation, but decisions are made by volunteers
                and may not always be immediate.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>8. Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                You may delete your account at any time through your profile settings. We may
                suspend or terminate accounts that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Repeatedly violate these Terms</li>
                <li>Engage in abusive or harmful behavior</li>
                <li>Attempt to manipulate or game the system</li>
                <li>Violate Philippine laws</li>
              </ul>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>9. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                These Terms are governed by the laws of the Republic of the Philippines. Any
                disputes shall be resolved in Philippine courts with jurisdiction.
              </p>
              <p className="text-gray-700">We are committed to operating in compliance with:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Data Privacy Act of 2012 (RA 10173)</li>
                <li>Cybercrime Prevention Act of 2012 (RA 10175)</li>
                <li>Constitution of the Republic of the Philippines</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                For questions about these Terms or to report violations, please contact our
                volunteer team:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Email:</strong> volunteers@bettergov.ph
                  <br />
                  <strong>Response Time:</strong> 3-5 business days (volunteer-operated)
                  <br />
                  <strong>Platform:</strong> Use the contact form on our website
                </p>
              </div>
              <p className="text-sm text-gray-800">
                Please note that as a volunteer-operated platform, response times may vary. We
                appreciate your patience and understanding.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-gray-800">
                Made with ❤️ by Filipino Volunteers
              </span>
            </div>
            <p className="text-gray-800 mb-4">
              BetterGov.ph is a non-profit, volunteer-driven initiative dedicated to strengthening
              democracy and civic engagement in the Philippines.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
              <Link to="/privacy">
                <Button variant="outline">Privacy Policy</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
