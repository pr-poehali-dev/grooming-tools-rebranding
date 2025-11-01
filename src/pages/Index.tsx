import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';

interface Material {
  id: number;
  name: string;
  description: string;
  current_stock: number;
  min_stock: number;
  price: number;
  unit: string;
}

interface Consumption {
  id: number;
  product_name: string;
  quantity_used: number;
  consumption_date: string;
}

const API_URL = 'https://functions.poehali.dev/a1d026d2-cb73-4494-82fb-635ec2538978';

const Index = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [activeTab, setActiveTab] = useState<'materials' | 'transactions'>('materials');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConsumeDialogOpen, setIsConsumeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchMaterials = async () => {
    try {
      const response = await fetch(`${API_URL}?table=products`);
      const data = await response.json();
      setMaterials(data.products || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить материалы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumptions = async () => {
    try {
      const response = await fetch(`${API_URL}?table=material_consumption`);
      const data = await response.json();
      setConsumptions(data.consumptions || []);
    } catch (error) {
      console.error('Failed to load consumptions:', error);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchConsumptions();
  }, []);

  const handleAddMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_product',
          name: formData.get('name'),
          description: formData.get('description'),
          price: parseFloat(formData.get('price') as string),
          current_stock: parseFloat(formData.get('stock') as string),
          min_stock: parseFloat(formData.get('minStock') as string)
        })
      });
      
      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Материал добавлен'
        });
        setIsAddDialogOpen(false);
        fetchMaterials();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить материал',
        variant: 'destructive'
      });
    }
  };

  const handleConsumeMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_consumption',
          product_id: selectedMaterial,
          quantity: parseFloat(formData.get('quantity') as string)
        })
      });
      
      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Расход материала зафиксирован'
        });
        setIsConsumeDialogOpen(false);
        fetchMaterials();
        fetchConsumptions();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось записать расход',
        variant: 'destructive'
      });
    }
  };

  const totalItems = materials.reduce((sum, item) => sum + item.current_stock, 0);
  const lowStockItems = materials.filter(item => item.current_stock <= item.min_stock).length;
  const totalValue = materials.reduce((sum, item) => sum + (item.current_stock * item.price), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

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
              <div className="text-3xl font-bold text-gray-900">{totalItems.toFixed(0)}</div>
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
                  Расход материалов
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
                  <form onSubmit={handleAddMaterial} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Название</Label>
                      <Input id="name" name="name" placeholder="Например: Ножницы" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Описание</Label>
                      <Input id="description" name="description" placeholder="Для чего используется" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Количество</Label>
                        <Input id="stock" name="stock" type="number" placeholder="10" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minStock">Мин. запас</Label>
                        <Input id="minStock" name="minStock" type="number" placeholder="5" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Цена, ₽</Label>
                      <Input id="price" name="price" type="number" placeholder="500" required />
                    </div>
                    <Button type="submit" className="w-full">Сохранить</Button>
                  </form>
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
                      <TableHead className="font-semibold">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow 
                        key={material.id} 
                        className={
                          material.name === 'Перчатки' 
                            ? 'bg-red-50 hover:bg-red-100' 
                            : 'hover:bg-gray-50'
                        }
                      >
                        <TableCell className="font-medium">{material.id}</TableCell>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell className="text-gray-600">{material.description}</TableCell>
                        <TableCell className="text-right">
                          <span className={material.current_stock <= material.min_stock ? 'text-orange-600 font-semibold' : ''}>
                            {material.current_stock} {material.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-gray-600">{material.min_stock}</TableCell>
                        <TableCell className="text-right font-medium">{material.price} ₽</TableCell>
                        <TableCell>
                          <Badge className={
                            material.current_stock <= material.min_stock 
                              ? "bg-gradient-to-r from-red-100 to-orange-100 text-red-700 hover:from-red-100 hover:to-orange-100 font-semibold shadow-sm" 
                              : "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-100 hover:to-emerald-100 font-semibold shadow-sm"
                          }>
                            {material.current_stock <= material.min_stock ? '⚠️ НИЗКИЙ ЗАПАС' : '✓ В НАЛИЧИИ'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedMaterial(material.id);
                              setIsConsumeDialogOpen(true);
                            }}
                          >
                            <Icon name="Minus" size={14} className="mr-1" />
                            Списать
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="rounded-lg border">
                {consumptions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">Материал</TableHead>
                        <TableHead className="font-semibold text-right">Количество</TableHead>
                        <TableHead className="font-semibold">Дата</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consumptions.map((consumption) => (
                        <TableRow key={consumption.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{consumption.id}</TableCell>
                          <TableCell>{consumption.product_name}</TableCell>
                          <TableCell className="text-right">{consumption.quantity_used}</TableCell>
                          <TableCell>{new Date(consumption.consumption_date).toLocaleString('ru-RU')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Icon name="History" size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg">История расхода пуста</p>
                    <p className="text-sm mt-2">Здесь будут отображаться все операции с материалами</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isConsumeDialogOpen} onOpenChange={setIsConsumeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Списать материал</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleConsumeMaterial} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Количество</Label>
                <Input 
                  id="quantity" 
                  name="quantity" 
                  type="number" 
                  step="0.1"
                  placeholder="1" 
                  required 
                />
              </div>
              <Button type="submit" className="w-full">Списать</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;