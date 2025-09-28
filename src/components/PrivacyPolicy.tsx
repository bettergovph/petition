import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react'

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-800 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect
              your personal information on BetterGov.ph.
            </p>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Privacy Policy Coming Soon</h2>
            <p className="text-blue-800 mb-6">
              We are currently drafting a comprehensive privacy policy that will detail how we
              handle your personal data in compliance with the Data Privacy Act of 2012 (RA 10173).
            </p>
            <div className="bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What we're working on:</h3>
              <ul className="text-left text-blue-800 space-y-1">
                <li>• Data collection and usage practices</li>
                <li>• Cookie and tracking policies</li>
                <li>• Third-party service integrations</li>
                <li>• User rights and data control</li>
                <li>• Security measures and data protection</li>
              </ul>
            </div>
            <p className="text-sm text-blue-700">
              In the meantime, we follow best practices for data protection and only collect
              information necessary for platform functionality.
            </p>
          </CardContent>
        </Card>

        {/* Temporary Privacy Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                What We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• Basic profile information (name, email)</li>
                <li>• Petition content and signatures</li>
                <li>• Usage analytics (anonymized)</li>
                <li>• Authentication data from OAuth providers</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                How We Protect It
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• Secure HTTPS encryption</li>
                <li>• OAuth authentication</li>
                <li>• No data selling to third parties</li>
                <li>• Regular security updates</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Questions About Privacy?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              If you have questions about how we handle your data, please contact our volunteer
              team:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800">
                <strong>Email:</strong> volunteers@bettergov.ph
                <br />
                <strong>Subject:</strong> Privacy Policy Inquiry
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4">
            <Link to="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
            <Link to="/terms">
              <Button variant="outline">Terms of Service</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
