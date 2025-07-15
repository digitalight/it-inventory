// app/parts/page.tsx
import { PartsTable } from "./parts-table";
import { getCategories, getOutOfStockParts, getPartsStats, getPartsWithOrderInfo } from "./actions";
import { AddPartModal } from "@/components/add-part-modal";
import { AddCategoryModal } from "@/components/add-category-modal";
import { EditCategoryModal } from "@/components/edit-category-modal";
import { DeleteCategoryModal } from "@/components/delete-category-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, TrendingUp, Layers, Plus, Edit } from "lucide-react";
import { requireAuth } from '@/lib/auth-simple';

export default async function PartsPage() {
  await requireAuth(); // Protect this page
  
  const [parts, categories, outOfStockParts, stats] = await Promise.all([
    getPartsWithOrderInfo(),
    getCategories(),
    getOutOfStockParts(),
    getPartsStats()
  ]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Parts Inventory</h1>
          <p className="text-gray-600 mt-2">Manage your computer parts and stock levels</p>
        </div>
        <AddPartModal categories={categories} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalParts}</div>
            <p className="text-xs text-blue-600">Unique part types</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{stats.outOfStockCount}</div>
            <p className="text-xs text-red-600">Need immediate restocking</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.lowStockCount}</div>
            <p className="text-xs text-orange-600">Below minimum threshold</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Layers className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.totalCategories}</div>
            <p className="text-xs text-green-600">Part categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Full Width */}
      <div className="space-y-6">
        {/* Parts Table - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle>All Parts</CardTitle>
            <CardDescription>
              Manage your inventory of computer parts and components.
            </CardDescription>
          </CardHeader>            <CardContent>
              <PartsTable parts={parts} categories={categories} />
            </CardContent>
        </Card>

        {/* Bottom Row - Stock Alerts and Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Out of Stock Parts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>
                Parts that need immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outOfStockParts.length > 0 ? (
                <div className="space-y-3">
                  {outOfStockParts.slice(0, 5).map((part: any) => (
                    <div key={part.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{part.name}</div>
                        <div className="text-xs text-gray-500">{part.category.name}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive" className="text-xs">
                          {part.stockLevel === 0 ? "Out" : `${part.stockLevel}/${part.minStockLevel}`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {outOfStockParts.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{outOfStockParts.length - 5} more items need attention
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>All parts are adequately stocked!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-500" />
                  <CardTitle>Categories</CardTitle>
                </div>
                <AddCategoryModal 
                  triggerButton={
                    <Button size="sm" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  }
                />
              </div>
              <CardDescription>
                Parts organized by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map((category: any) => (
                  <div key={category.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category._count.parts}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <EditCategoryModal 
                        category={category}
                        triggerButton={
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteCategoryModal 
                        category={category}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
