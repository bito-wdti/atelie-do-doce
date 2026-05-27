import React, { useState } from 'react';
import { 
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X, 
  Image as ImageIcon, Save, AlertTriangle, Cake, Heart, Phone, ChevronDown,
  Camera, Check, Scissors, Menu, GripVertical 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import { productsApi } from '../services/api';

export default function AdminCatalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalDropdownOpen, setIsModalDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string; order_index: number }[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    detail: '',
    category: 'Bolos',
    price: '',
    stock: 'Em estoque',
    img: ''
  });

  // Cropper State
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.list();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await productsApi.categories();
      setCategories(data);
    } catch {
      setCategories([
        { id: 1, name: 'Vulcões', slug: 'Vulcões', order_index: 1 },
        { id: 2, name: 'Bolos', slug: 'Bolos', order_index: 2 },
        { id: 3, name: 'Tortas', slug: 'Tortas', order_index: 3 },
        { id: 4, name: 'Doces', slug: 'Doces', order_index: 4 },
        { id: 5, name: 'Bebidas', slug: 'Bebidas', order_index: 5 },
        { id: 6, name: 'Normais', slug: 'Normais', order_index: 6 },
      ]);
    }
  };

  React.useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageToCrop!, croppedAreaPixels);
      setFormData(prev => ({ ...prev, img: croppedImage }));
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
    }
  };

  async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (error) => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  }

  const handleOpenModal = (type: 'create' | 'edit' | 'delete', product?: any) => {
    setModalType(type);
    setSelectedProduct(product || null);
    if ((type === 'edit' || type === 'delete') && product) {
      setFormData({
        name: product.name,
        detail: product.detail,
        category: product.category,
        price: product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
        stock: product.stock,
        img: product.img
      });
    } else {
      setFormData({
        name: '',
        detail: '',
        category: 'Bolos',
        price: '',
        stock: 'Em estoque',
        img: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleSave = async () => {
    // Convert BRL format (R$ 1.234,56) back to number for storage
    const numericPrice = typeof formData.price === 'string' 
      ? parseFloat(formData.price.replace(/[^\d,]/g, '').replace(',', '.')) 
      : formData.price;

    const productData = {
      name: formData.name,
      detail: formData.detail,
      category: formData.category,
      price: numericPrice || 0,
      stock: formData.stock,
      img: formData.img
    };

    const saveOperation = async () => {
      if (modalType === 'create') {
        await productsApi.create(productData);
      } else if (modalType === 'edit' && selectedProduct) {
        await productsApi.update(selectedProduct.id, productData);
      } else if (modalType === 'delete' && selectedProduct) {
        await productsApi.delete(selectedProduct.id);
      }

      await fetchProducts();
      closeModal();
    };

    toast.promise(saveOperation(), {
      loading: 'Salvando alterações...',
      success: modalType === 'delete' ? 'Produto excluído com sucesso!' : 'Produto salvo com sucesso!',
      error: 'Erro ao salvar alterações.',
    });
  };

  const formatBRL = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "";
    const numericValue = Number(cleanValue) / 100;
    return numericValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRL(e.target.value);
    setFormData({ ...formData, price: formatted });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.detail && product.detail.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        return newItems;
      });
    }
  };

  const categoriesList = ["Todos", ...categories.map(c => c.slug)];

  // Sortable Item Component
  function SortableItem(props: any) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({id: props.id});
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
    
    return (
      <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-white border border-indigo-100 rounded-none shadow-sm touch-none">
        <div className="flex items-center gap-3">
            <button {...attributes} {...listeners} className="p-2 text-gray-400 hover:text-primary cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
            </button>
            <span className="text-gray-900 text-base leading-relaxed">{props.children}</span>
        </div>
        <div className="flex items-center gap-1 opacity-50">
          <button 
            disabled
            className="p-1 text-gray-400"
          >
            <ChevronLeft className="w-5 h-5 rotate-90" />
          </button>
          <button 
             disabled
             className="p-1 text-gray-400"
          >
            <ChevronRight className="w-5 h-5 rotate-90" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 pt-12 md:p-8 md:pt-12 relative">
      <div className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-end gap-4 mb-4">

        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center justify-center gap-2 px-4 h-12 bg-white text-primary border border-indigo-100 rounded-xl hover:bg-indigo-50/50 transition-all shadow-sm flex-1 md:flex-none"
          >
            <Menu className="w-5 h-5" />
            <span className="md:hidden">Organizar</span>
            <span className="text-sm font-medium hidden md:inline">Organizar Categorias</span>
          </button>
          <button 
            onClick={() => handleOpenModal('create')}
            className="flex items-center justify-center flex-1 md:flex-none gap-2 px-6 h-12 bg-primary text-white rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/30 group"
          >
            <div className="bg-white/20 p-1 rounded-xl group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="md:hidden">Novo</span>
            <span className="text-sm font-medium hidden md:inline">Adicionar Novo Produto</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-base leading-relaxed focus:ring-1 focus:ring-primary outline-none transition-all" 
              placeholder="Buscar por nome ou detalhes do produto..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative flex-1 min-w-[200px]">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-12 px-4 bg-white border border-[#e7d0d6] rounded-xl text-sm text-left text-gray-700 flex items-center justify-between group hover:bg-indigo-50/50 transition-all focus:ring-2 focus:ring-primary outline-none shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50/50 p-1.5 rounded-xl text-primary">
                  {selectedCategory === "Todos" && <Search className="w-4 h-4" />}
                  {selectedCategory === "Bolos" && <Cake className="w-4 h-4" />}
                  {selectedCategory === "Tortas" && <Cake className="w-4 h-4" />}
                  {selectedCategory === "Doces" && <Heart className="w-4 h-4" />}
                  {selectedCategory === "Bebidas" && <Phone className="w-4 h-4" />}
                </div>
                <span className="text-gray-900 text-sm font-medium leading-relaxed">
                  {selectedCategory === "Todos" ? "Todas as Categorias" : selectedCategory}
                </span>
              </div>
              <div className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4 text-primary" />
              </div>
            </button>

            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-indigo-100 z-50 overflow-hidden animate-fade-in">
                  {categoriesList.map((catName) => (
                    <button
                      key={catName}
                      onClick={() => {
                        setSelectedCategory(catName);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-5 py-3 text-left text-sm flex items-center gap-3 hover:bg-indigo-50/50 transition-colors ${
                        selectedCategory === catName ? "bg-indigo-50/50 text-primary" : "text-gray-600 font-medium"
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl ${selectedCategory === catName ? "bg-primary text-white" : "bg-gray-50 text-gray-400"}`}>
                        {catName === "Todos" && <Search className="w-4 h-4" />}
                        {catName === "Bolos" && <Cake className="w-4 h-4" />}
                        {catName === "Normais" && <Cake className="w-4 h-4" />}
                        {catName === "Tortas" && <Cake className="w-4 h-4" />}
                        {catName === "Vulcões" && <Phone className="w-4 h-4" />}
                        {catName === "Doces" && <Heart className="w-4 h-4" />}
                        {catName === "Bebidas" && <Phone className="w-4 h-4" />}
                      </div>
                      {catName === "Todos" ? "Todas as Categorias" : catName}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 mb-8">
        {paginatedProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 space-y-4">
            <div className="flex gap-4 items-center">
              <div 
                className="w-16 h-16 rounded-xl bg-cover bg-center border border-indigo-50 shadow-sm shrink-0" 
                style={{backgroundImage: `url('${product.img}')`}}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-900 text-base leading-relaxed truncate">{product.name}</h4>
                <p className="text-gray-500 text-base leading-relaxed mb-2 truncate">{product.detail}</p>
                <span className="inline-block px-3 py-0.5 bg-indigo-50/50 text-primary text-sm rounded-xl">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-gray-500 text-base leading-relaxed">Preço</p>
                <p className="text-2xl text-gray-700">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <p className="text-[#974e60] text-base leading-relaxed">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-base leading-relaxed ${product.stock === 'Em estoque' ? 'bg-green-50 text-green-600' : 'bg-indigo-50/50 text-primary'}`}>
                  {product.stock}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-indigo-50/50">
              <button 
                onClick={() => handleOpenModal('edit', product)}
                className="flex items-center justify-center gap-2 py-2 bg-indigo-50/50/50 text-[#974e60] rounded-xl hover:bg-indigo-100/50/50 transition-all border border-indigo-100/50 text-base leading-relaxed"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button 
                onClick={() => handleOpenModal('delete', product)}
                className="flex items-center justify-center gap-2 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all border border-red-100/50 text-base leading-relaxed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between pt-4 pb-2 border-t border-indigo-50">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl border border-indigo-100 text-[#974e60] bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-base leading-relaxed text-[#974e60] opacity-60">Página</span>
              <span className="text-lg text-primary leading-none">{currentPage} de {totalPages || 1}</span>
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-3 rounded-xl border border-indigo-100 text-[#974e60] bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-500  tracking-widest text-center">Produto</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500  tracking-widest text-center">Categoria</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500  tracking-widest text-center">Preço</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500  tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-500  tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-4 pl-12">
                            <div className="w-12 h-12 rounded-xl bg-cover bg-center border border-gray-100 shadow-sm shrink-0" style={{backgroundImage: `url('${product.img}')`}}></div>
                            <div className="text-left min-w-0 max-w-[200px] lg:max-w-xs">
                                <p className="text-gray-900 text-base leading-relaxed truncate">{product.name}</p>
                                <p className="text-gray-500 text-base leading-relaxed truncate">{product.detail}</p>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 text-base leading-relaxed">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="text-gray-700 text-base leading-relaxed">
                          {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex justify-center">
                             <span className={`px-3 py-1 rounded-full text-base leading-relaxed ${product.stock === 'Em estoque' ? 'bg-green-100 text-green-700' : 'bg-indigo-50/50 text-primary'}`}>
                                {product.stock}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                            <button 
                               onClick={() => handleOpenModal('edit', product)}
                               className="p-2 text-[#974e60] hover:text-primary hover:bg-indigo-50/50 rounded-xl transition-all"
                            >
                               <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                               onClick={() => handleOpenModal('delete', product)}
                               className="p-2 text-[#974e60] hover:text-primary hover:bg-indigo-50/50 rounded-xl transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between bg-white border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Mostrando {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length} produtos
          </p>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-400 mr-2">Página {currentPage} de {totalPages || 1}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-indigo-100 transform transition-all flex flex-col max-h-[90vh] ${modalType === 'delete' ? 'max-w-md' : ''}`}>
            
            {/* Modal Header */}
            <div className={`p-4 flex items-center justify-between border-b border-indigo-50 ${modalType === 'delete' ? 'bg-red-50' : 'bg-indigo-50'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${modalType === 'delete' ? 'bg-red-500' : 'bg-primary'}`}>
                  {modalType === 'delete' ? <Trash2 className="w-5 h-5" /> : (modalType === 'edit' ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
                </div>
                <div className="pt-0.5">
                  <h2 className="text-gray-900 text-lg font-semibold leading-none font-display">
                    {modalType === 'create' ? 'Novo Produto' : (modalType === 'edit' ? 'Editar Produto' : 'Excluir Produto')}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {modalType === 'delete' ? 'Confirme esta ação irreversível' : 'Preencha as informações abaixo'}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-full p-0.5 shadow-sm border border-indigo-50">
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-indigo-50/50 rounded-full transition-colors text-gray-400 hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 md:p-8 text-center scrollbar-hide">
              {modalType === 'delete' ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-gray-800 text-base leading-relaxed">Tem certeza que deseja excluir o produto?</p>
                    <p className="text-gray-900 text-xl leading-relaxed mt-1">"{selectedProduct?.name}"</p>
                    <p className="text-sm text-gray-500 mt-4 bg-red-50 p-3 rounded-xl border border-red-100 text-left">
                      Esta ação não poderá ser desfeita e o produto será removido permanentemente do seu catálogo.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Picker Section - Consistent with Screenshot and Landing Page Dimension */}
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => document.getElementById('product-image-input')?.click()}
                    >
                      {/* Reduced size for better fitting */}
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-[24px] bg-white shadow-xl border-4 border-white overflow-hidden flex items-center justify-center transition-all group-hover:scale-[1.02] group-hover:shadow-primary/30">
                        {formData.img ? (
                          <img src={formData.img} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-indigo-50">
                             <ImageIcon className="w-12 h-12 opacity-50" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-primary p-2 rounded-xl border-4 border-white shadow-lg text-white group-hover:bg-primary-dark transition-colors">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <input 
                        id="product-image-input"
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageChange}
                      />
                    </div>
                    <p className="mt-4 text-base leading-relaxed text-[#974e60] opacity-60">
                      Foto do Produto
                    </p>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 text-left">
                        <label className="text-gray-500 text-xs font-semibold  tracking-wider mb-1.5 block ml-1">Nome do Produto</label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-indigo-50/50/30 border border-indigo-100 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-base leading-relaxed"
                          placeholder="Ex: Bolo de Chocolate Belga"
                        />
                      </div>
                      
                      <div className="text-left relative">
                        <label className="text-gray-500 text-xs font-semibold  tracking-wider mb-1.5 block ml-1">Categoria</label>
                        <button
                          onClick={() => setIsModalDropdownOpen(!isModalDropdownOpen)}
                          className="w-full h-[50px] px-4 bg-indigo-50/50/30 border border-indigo-100 rounded-xl text-gray-800 flex items-center justify-between group hover:bg-indigo-100/50/30 transition-all focus:ring-2 focus:ring-primary/50 outline-none text-base leading-relaxed"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-primary p-1.5 rounded-xl text-white">
                              {formData.category === "Bolos" && <Cake className="w-3.5 h-3.5" />}
                              {formData.category === "Tortas" && <Cake className="w-3.5 h-3.5" />}
                              {formData.category === "Doces" && <Heart className="w-3.5 h-3.5" />}
                              {formData.category === "Bebidas" && <Phone className="w-3.5 h-3.5" />}
                            </div>
                            <span>{formData.category}</span>
                          </div>
                          <div className={`transition-transform duration-300 ${isModalDropdownOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-4 h-4 text-primary" />
                          </div>
                        </button>

                        {isModalDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-120" 
                              onClick={() => setIsModalDropdownOpen(false)}
                            />
                            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-indigo-100 z-130 overflow-hidden animate-fade-in max-h-[250px] overflow-y-auto">
                              {categories.map((catObj) => (
                                <button
                                  key={catObj.id}
                                  onClick={() => {
                                    setFormData({...formData, category: catObj.name});
                                    setIsModalDropdownOpen(false);
                                  }}
                                  className={`w-full px-5 py-3 text-left text-sm flex items-center gap-3 hover:bg-indigo-50/50 transition-colors ${
                                    formData.category === catObj.name ? "bg-indigo-50/50 text-primary" : "text-gray-600 font-medium"
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-xl ${formData.category === catObj.name ? "bg-primary text-white" : "bg-gray-50 text-gray-400"}`}>
                                    {catObj.name === "Bolos" && <Cake className="w-4 h-4" />}
                                    {catObj.name === "Tortas" && <Cake className="w-4 h-4" />}
                                    {catObj.name === "Doces" && <Heart className="w-4 h-4" />}
                                    {catObj.name === "Bebidas" && <Phone className="w-4 h-4" />}
                                  </div>
                                  {catObj.name}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="text-left">
                        <label className="text-gray-500 text-xs font-semibold  tracking-wider mb-1.5 block ml-1">Preço (R$)</label>
                        <input 
                          type="text" 
                          value={formData.price}
                          onChange={handlePriceChange}
                          className="w-full px-4 py-3 bg-indigo-50/50/30 border border-indigo-100 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-base leading-relaxed"
                          placeholder="R$ 0,00"
                        />
                      </div>

                      <div className="col-span-2 text-left">
                          <label className="text-gray-500 text-xs font-semibold  tracking-wider mb-1.5 block ml-1">Detalhes / Descrição</label>
                          <textarea 
                            value={formData.detail}
                            onChange={(e) => {
                              setFormData({...formData, detail: e.target.value});
                              e.target.style.height = 'auto';
                              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                            rows={1}
                            className="w-full px-4 py-3 bg-indigo-50/50/30 border border-indigo-100 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-base leading-relaxed resize-none overflow-y-auto shadow-inner max-h-[120px] min-h-[50px]"
                            placeholder="Ex: Fatia - 150g ou Inteiro - 2kg"
                          />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-indigo-50/50/30 border-t border-indigo-50 flex gap-3">
              <button 
                onClick={closeModal}
                className={`flex-1 py-3 text-base leading-relaxed rounded-xl transition-all ${
                  modalType === 'delete' 
                    ? 'border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white' 
                    : 'text-gray-600 hover:bg-black/5'
                }`}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className={`flex-[1.5] py-3 flex items-center justify-center gap-2 text-white text-base leading-relaxed rounded-xl shadow-lg transition-all hover:brightness-110 active:scale-95 ${modalType === 'delete' ? 'bg-red-500 shadow-red-200' : 'bg-primary shadow-primary/200'}`}
              >
                {modalType === 'delete' ? (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Confirmar Exclusão</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{modalType === 'create' ? 'Cadastrar Produto' : 'Salvar Alterações'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CROP MODAL */}
      {imageToCrop && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-120 animate-in fade-in duration-200" onClick={() => setImageToCrop(null)} />
          <div className="bg-white rounded-none shadow-2xl z-130 w-full max-w-lg overflow-hidden flex flex-col h-[600px] max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 flex items-center justify-between border-b border-indigo-50 bg-indigo-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                  <Scissors className="w-5 h-5" />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-gray-900 text-lg font-semibold leading-none font-display">Ajustar Imagem</h3>
                  <p className="text-sm text-gray-500 mt-1">Selecione a melhor parte da foto</p>
                </div>
              </div>
              <div className="bg-white rounded-full p-0.5 shadow-sm border border-indigo-50">
                <button 
                  onClick={() => setImageToCrop(null)}
                  className="p-2 hover:bg-indigo-50/50 rounded-full transition-colors text-gray-400 hover:text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-gray-900">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-base leading-relaxed text-gray-400  tracking-wider">
                  <span>Zoom</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-50/50 rounded-xl appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setImageToCrop(null)}
                  className="flex-1 py-3 text-gray-600 hover:bg-black/5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={createCroppedImage}
                  className="flex-[1.5] py-3 flex items-center justify-center gap-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/200 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Check className="w-5 h-5" />
                  <span>Corte Finalizado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Category Reorder Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/5 backdrop-blur-xl animate-fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-indigo-100 transform transition-all flex flex-col max-h-[90vh]">
             <div className="p-4 flex items-center justify-between border-b border-indigo-50 bg-indigo-50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                   <Menu className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="text-gray-900 text-base leading-relaxed mb-1 font-display">Organizar</h3>
                   <p className="text-base leading-relaxed text-[#974e60]">Arraste para reordenar</p>
                 </div>
               </div>
               <div className="bg-white rounded-full p-0.5 shadow-sm border border-indigo-50">
                <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-indigo-50/50 rounded-full text-gray-400 hover:text-primary transition-colors"><X className="w-5 h-5" /></button>
               </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={categories.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((cat) => (
                      <SortableItem key={cat.id} id={cat.id}>
                          {cat.name}
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
             </div>

             <div className="p-4 bg-indigo-50/50/30 border-t border-indigo-50">
                <button 
                  onClick={() => setShowCategoryModal(false)}
                  className="w-full py-3 bg-primary text-white text-base leading-relaxed rounded-xl shadow-lg shadow-primary/200 hover:brightness-110 active:scale-95 transition-all"
                >
                 Concluir
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
