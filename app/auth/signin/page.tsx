"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Chrome className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            School IT Inventory
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Google Workspace account
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in with your authorized Google Workspace account to access the IT inventory system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-3"
              size="lg"
            >
              <Chrome className="h-5 w-5" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Only authorized email addresses can access this system.
            Contact your administrator if you need access.
          </p>
        </div>
      </div>
    </div>
  )
}
