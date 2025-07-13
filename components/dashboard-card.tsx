"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Users, Wrench, AlertTriangle, Package } from "lucide-react"

interface DashboardCardProps {
  title: string
  value: number
  description: string
  iconName: 'laptop' | 'users' | 'wrench' | 'alertTriangle' | 'package'
  className?: string
}

export function DashboardCard({ 
  title, 
  value, 
  description, 
  iconName,
  className = ""
}: DashboardCardProps) {
  const getIcon = () => {
    switch (iconName) {
      case 'laptop':
        return Laptop
      case 'users':
        return Users
      case 'wrench':
        return Wrench
      case 'alertTriangle':
        return AlertTriangle
      case 'package':
        return Package
      default:
        return Laptop
    }
  }

  const Icon = getIcon()

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}
