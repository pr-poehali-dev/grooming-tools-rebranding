import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Material {
  id: number;
  name: string;
  description: string;
  currentStock: number;
  minStock: number;
  price: number;
  status: string;
}

const Index = () => {
  const [materials, setMaterials] = useState<Material[]>([
    {
      id: 2,
      name: 'Машинки',
      description: 'Инструмент для стрижек',
      currentStock: 10,
      minStock: 5,
      price: 560,
      status: 'В НАЛИЧИИ'
    },
    {
      id: 6,
      name: 'Маска',
      description: 'Для роста волос',
      currentStock: 10,
      minStock: 1,
      price: 900,
      status: 'В НАЛИЧИИ'
    },
    {
      id: 3,
      name: 'Шампунь',
      description: 'После стрижек',
      currentStock: 40,
      minStock: 1,
      price: 700,
      status: 'В НАЛИЧИИ'
    },
    {
      id: 5,
      name: 'Крем после бритья',
      description: 'Успокаивающий',
      currentStock: 7,
      minStock: 2,
      price: 450,
      status: 'В НАЛИЧИИ'
    },
    {
      id: 1,
      name: 'Перчатки',
      description: 'Для мастеров',
      currentStock: 11,
      minStock: 10,
      price: 10,
      status: 'В НАЛИЧИИ'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'materials' | 'transactions'>('materials');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const totalItems = materials.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockItems = materials.filter(item => item.currentStock <= item.minStock).length;
  const totalValue = materials.reduce((sum, item) => sum + (item.currentStock * item.price), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Учет материалов салона
          </h1>
          <p className="text-gray-600">Управление складом и запасами</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Всего единиц
              </CardTitle>
              <Icon name="Package" className="text-purple-600" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
              <p className="text-xs text-gray-500 mt-1">на складе</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Требуют внимания
              </CardTitle>
              <Icon name="AlertTriangle" className="text-orange-600" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{lowStockItems}</div>
              <p className="text-xs text-gray-500 mt-1">позиций на минимуме</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Общая стоимость
              </CardTitle>
              <Icon name="DollarSign" className="text-green-600" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalValue.toLocaleString()} ₽</div>
              <p className="text-xs text-gray-500 mt-1">запасов на складе</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'materials' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('materials')}
                  className="gap-2"
                >
                  <Icon name="Package" size={16} />
                  Материалы
                </Button>
                <Button
                  variant={activeTab === 'transactions' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('transactions')}
                  className="gap-2"
                >
                  <Icon name="History" size={16} />
                  Транзакции
                </Button>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <Icon name="Plus" size={16} />
                    Добавить материал
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Новый материал</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Название</Label>
                      <Input id="name" placeholder="Например: Ножницы" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Input id="description" placeholder="Для чего используется" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Количество</Label>
                        <Input id="stock" type="number" placeholder="10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minStock">Мин. запас</Label>
                        <Input id="minStock" type="number" placeholder="5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Цена, ₽</Label>
                      <Input id="price" type="number" placeholder="500" />
                    </div>
                    <Button className="w-full">Сохранить</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'materials' && (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Название</TableHead>
                      <TableHead className="font-semibold">Описание</TableHead>
                      <TableHead className="font-semibold text-right">Текущий запас</TableHead>
                      <TableHead className="font-semibold text-right">Мин. запас</TableHead>
                      <TableHead className="font-semibold text-right">Цена</TableHead>
                      <TableHead className="font-semibold">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{material.id}</TableCell>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell className="text-gray-600">{material.description}</TableCell>
                        <TableCell className="text-right">
                          <span className={material.currentStock <= material.minStock ? 'text-orange-600 font-semibold' : ''}>
                            {material.currentStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-600">{material.minStock}</TableCell>
                        <TableCell className="text-right font-medium">{material.price} ₽</TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            {material.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="text-center py-12 text-gray-500">
                <Icon name="History" size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg">История транзакций пуста</p>
                <p className="text-sm mt-2">Здесь будут отображаться все операции с материалами</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;