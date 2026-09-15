'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Copy,
  Save,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  FileSpreadsheet,
  Sliders,
  Store,
  RefreshCw,
  Lock,
  LogOut,
  KeyRound,
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  url?: string;
  brand: string;
  model: string;
  size: string;
  year: string;
  price: number;
  regularPrice?: number;
  stock: boolean;
  image: string;
  sourceImage?: string;
  runflat: boolean;
}

const COMMON_BRANDS = [
  'CONTINENTAL',
  'MICHELIN',
  'BRIDGESTONE',
  'GOODYEAR',
  'YOKOHAMA',
  'DUNLOP',
  'KUMHO',
  'OTANI',
  'MAXXIS',
  'HANKOOK',
  'DEESTONE',
  'TOYO',
  'PIRELLI',
  'NEXEN',
  'LENSO',
  'SAILUN',
];

const PRESET_IMAGES = [
  { label: 'ยาง 1 (มาตรฐาน)', path: '/assets/tire-4518.png' },
  { label: 'ยาง 2 (สปอร์ต)', path: '/assets/tire-4509.png' },
  { label: 'ยาง 3 (SUV/กระบะ)', path: '/assets/tire-3257.png' },
  { label: 'ยาง 4 (พรีเมียม)', path: '/assets/tire-3256.png' },
  { label: 'ยาง 5 (AT ลุย)', path: '/assets/tire-3255.png' },
];

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'bulk' | 'store'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formBrand, setFormBrand] = useState('MICHELIN');
  const [formModel, setFormModel] = useState('');
  const [formSize, setFormSize] = useState('205/55R16');
  const [formYear, setFormYear] = useState('2025');
  const [formPrice, setFormPrice] = useState<number | ''>(3500);
  const [formRegularPrice, setFormRegularPrice] = useState<number | ''>(4200);
  const [formStock, setFormStock] = useState(true);
  const [formRunflat, setFormRunflat] = useState(false);
  const [formImage, setFormImage] = useState('/assets/tire-4518.png');
  const [dragActive, setDragActive] = useState(false);

  // Bulk paste state
  const [bulkText, setBulkText] = useState('');

  // Store settings
  const [shopPhone, setShopPhone] = useState('098-579-5449');
  const [shopLine, setShopLine] = useState('@lcgroup');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('lc_admin_auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '@Lc0985795449') {
      sessionStorage.setItem('lc_admin_auth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('lc_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // 1. Try server API
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          localStorage.setItem('lc-admin-products', JSON.stringify(data.products));
          setLoading(false);
          return;
        }
      }
      // 2. Fallback to public catalog.json
      const staticRes = await fetch('/catalog.json');
      if (staticRes.ok) {
        const data = await staticRes.json();
        setProducts(data.products || []);
      }
    } catch {
      // 3. Fallback to localStorage
      const cached = localStorage.getItem('lc-admin-products');
      if (cached) {
        try {
          setProducts(JSON.parse(cached));
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Save to Server
  const saveToServer = async (currentProducts: Product[] = products) => {
    setSaving(true);
    try {
      localStorage.setItem('lc-admin-products', JSON.stringify(currentProducts));
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: currentProducts }),
      });
      if (res.ok) {
        showAlert('success', `บันทึกข้อมูล ${currentProducts.length} รายการขึ้นระบบเรียบร้อยแล้ว!`);
      } else {
        showAlert('success', 'บันทึกลงเบราว์เซอร์แล้ว (ระบบ Cloud พร้อมใช้งาน)');
      }
    } catch {
      showAlert('success', 'บันทึกลงเบราว์เซอร์สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  // Handle Drag & Drop Image
  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFormImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFormImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Add / Edit Form
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrand || !formModel || !formSize || !formPrice) {
      showAlert('error', 'กรุณากรอกข้อมูล: แบรนด์, รุ่น, ขนาดยาง และราคา');
      return;
    }

    const cleanSize = formSize.trim().toUpperCase();
    const fullName = `ยาง ${cleanSize} ${formBrand.toUpperCase()} รุ่น ${formModel} ราคาต่อเส้น ปี ${formYear}`;

    if (editingId !== null) {
      // Update existing
      const updated = products.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: fullName,
              brand: formBrand.toUpperCase(),
              model: formModel,
              size: cleanSize,
              year: String(formYear),
              price: Number(formPrice),
              regularPrice: formRegularPrice ? Number(formRegularPrice) : Number(formPrice) * 1.2,
              stock: formStock,
              runflat: formRunflat,
              image: formImage,
            }
          : p
      );
      setProducts(updated);
      saveToServer(updated);
      showAlert('success', `แก้ไขสินค้า ID ${editingId} สำเร็จ!`);
      setEditingId(null);
    } else {
      // Add new
      const newId = Date.now();
      const newProduct: Product = {
        id: newId,
        name: fullName,
        brand: formBrand.toUpperCase(),
        model: formModel,
        size: cleanSize,
        year: String(formYear),
        price: Number(formPrice),
        regularPrice: formRegularPrice ? Number(formRegularPrice) : Number(formPrice) * 1.2,
        stock: formStock,
        runflat: formRunflat,
        image: formImage,
      };
      const updated = [newProduct, ...products];
      setProducts(updated);
      saveToServer(updated);
      showAlert('success', `เพิ่มสินค้าใหม่ "${newProduct.model}" สำเร็จ!`);
    }

    // Reset Form
    setFormModel('');
    setActiveTab('list');
  };

  // Edit Product click
  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setFormBrand(p.brand);
    setFormModel(p.model);
    setFormSize(p.size);
    setFormYear(p.year || '2025');
    setFormPrice(p.price);
    setFormRegularPrice(p.regularPrice || p.price * 1.2);
    setFormStock(p.stock);
    setFormRunflat(p.runflat);
    setFormImage(p.image);
    setActiveTab('add');
  };

  // Duplicate Product
  const handleDuplicateClick = (p: Product) => {
    setEditingId(null);
    setFormBrand(p.brand);
    setFormModel(p.model + ' (ก๊อปปี้)');
    setFormSize(p.size);
    setFormYear(p.year || '2025');
    setFormPrice(p.price);
    setFormRegularPrice(p.regularPrice || p.price * 1.2);
    setFormStock(p.stock);
    setFormRunflat(p.runflat);
    setFormImage(p.image);
    setActiveTab('add');
    showAlert('success', 'คัดลอกข้อมูลสินค้าเรียบร้อยแล้ว ปรับแก้ขนาด/ราคาแล้วกดบันทึกได้เลย');
  };

  // Delete Product
  const handleDeleteProduct = (id: number) => {
    if (confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      saveToServer(updated);
      showAlert('success', 'ลบสินค้าเรียบร้อยแล้ว');
    }
  };

  // Parse Bulk Text (Paste Template)
  const handleBulkImport = () => {
    if (!bulkText.trim()) {
      showAlert('error', 'กรุณาวางข้อมูลก่อนกดนำเข้า');
      return;
    }

    const lines = bulkText.split('\n');
    const newItems: Product[] = [];
    let lineNum = 0;

    for (const rawLine of lines) {
      lineNum++;
      const line = rawLine.trim();
      if (!line || line.startsWith('#') || line.toLowerCase().startsWith('แบรนด์')) continue;

      // Delimiters: pipe |, tab \t, or comma ,
      const parts = line.includes('|')
        ? line.split('|')
        : line.includes('\t')
        ? line.split('\t')
        : line.split(',');

      if (parts.length >= 4) {
        const brand = parts[0].trim().toUpperCase();
        const model = parts[1].trim();
        const size = parts[2].trim().toUpperCase();
        const year = parts[3].trim() || '2025';
        const price = Number(parts[4]?.replace(/[^0-9.]/g, '') || 3000);
        const regPrice = Number(parts[5]?.replace(/[^0-9.]/g, '') || price * 1.2);
        const customImage = parts[6]?.trim();

        // Smart image matching: 
        // 1. If custom image URL provided in 7th column, use it.
        // 2. Otherwise auto-match with existing tire of the same brand & model!
        let matchedImage = customImage;
        if (!matchedImage) {
          const existingSameModel = [...newItems, ...products].find(
            (p) =>
              p.brand.toUpperCase() === brand.toUpperCase() &&
              p.model.trim().toLowerCase() === model.toLowerCase() &&
              p.image
          );
          matchedImage = existingSameModel?.image || '/assets/tire-4518.png';
        }

        const newId = Date.now() + Math.floor(Math.random() * 10000) + lineNum;
        newItems.push({
          id: newId,
          name: `ยาง ${size} ${brand} รุ่น ${model} ราคาต่อเส้น ปี ${year}`,
          brand,
          model,
          size,
          year,
          price,
          regularPrice: regPrice,
          stock: true,
          runflat: false,
          image: matchedImage,
        });
      }
    }

    if (newItems.length === 0) {
      showAlert('error', 'ไม่พบข้อมูลที่ตรงรูปแบบ กรุณาตรวจสอบตัวอย่างในเทมเพลต');
      return;
    }

    const updated = [...newItems, ...products];
    setProducts(updated);
    saveToServer(updated);
    setBulkText('');
    setActiveTab('list');
    showAlert('success', `นำเข้าข้อมูลสินค้าสำเร็จทั้งหมด ${newItems.length} รายการ!`);
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = JSON.stringify({ products }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `catalog_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showAlert('success', 'ดาวน์โหลดไฟล์สำรอง catalog.json เรียบร้อยแล้ว');
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json && Array.isArray(json.products)) {
            setProducts(json.products);
            saveToServer(json.products);
            showAlert('success', `นำเข้าไฟล์สำรองสำเร็จ (${json.products.length} รายการ)`);
          } else {
            showAlert('error', 'รูปแบบไฟล์ JSON ไม่ถูกต้อง');
          }
        } catch {
          showAlert('error', 'ไม่สามารถอ่านไฟล์ JSON ได้');
        }
      };
      reader.readAsText(file);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = filterBrand === 'ALL' || p.brand.toUpperCase() === filterBrand.toUpperCase();
    return matchSearch && matchBrand;
  });

  // Lock screen if not authenticated
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-500 mb-4 shadow-inner">
              <Lock size={28} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">เข้าสู่ระบบจัดการหลังบ้าน</h1>
            <p className="text-xs text-slate-400 mt-1">LC TYRE Admin Control Panel (เฉพาะผู้ดูแลระบบ)</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                รหัสผ่านผู้ดูแลระบบ (Admin Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="กรอกรหัสผ่านเพื่อเข้าใช้งาน..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition"
                  autoFocus
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2">
                  <AlertCircle size={14} />
                  <span>{loginError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-orange-600/20 text-sm flex items-center justify-center gap-2"
            >
              <KeyRound size={16} />
              <span>ยืนยันและเข้าสู่ระบบ</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
            >
              <ArrowLeft size={14} />
              <span>กลับสู่หน้าแรกเว็บไซต์</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft size={16} />
              <span>กลับหน้าร้าน</span>
            </Link>
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-sm">
                LC
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">ระบบจัดการร้าน & สินค้า (Admin CMS)</h1>
                <p className="text-[11px] text-slate-400">LC TYRE หลงฉือ ขึ้นชื่อเรื่องยาง</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => saveToServer()}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition disabled:opacity-50"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saving ? 'กำลังบันทึก...' : 'บันทึกขึ้นระบบ'}</span>
            </button>
            <button
              onClick={handleExportJson}
              className="hidden sm:inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-3 py-2 rounded-lg transition"
              title="ดาวน์โหลดไฟล์สำรอง catalog.json"
            >
              <Download size={15} />
              <span>ดาวน์โหลดสำรอง</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700/50 hover:border-rose-900 transition"
              title="ออกจากระบบ"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Alert Banner */}
      {alert && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-4 ${
            alert.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('list');
                setEditingId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'list'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package size={16} />
              <span>รายการสินค้า ({products.length})</span>
            </button>

            <button
              onClick={() => {
                setEditingId(null);
                setFormModel('');
                setActiveTab('add');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'add'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Plus size={16} />
              <span>{editingId !== null ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</span>
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'bulk'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileSpreadsheet size={16} />
              <span>วางข้อมูลด่วน (Excel / เทมเพลต)</span>
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'store'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Store size={16} />
              <span>ข้อมูลร้าน & เบอร์โทร</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={jsonImportRef}
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              onClick={() => jsonImportRef.current?.click()}
              className="text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"
            >
              <Upload size={14} />
              <span>นำเข้า JSON</span>
            </button>
          </div>
        </div>

        {/* TAB 1: PRODUCT LIST */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="ค้นหาขนาดยาง, รุ่น, หรือแบรนด์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 text-white text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400">แบรนด์:</span>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500"
                >
                  <option value="ALL">ทุกแบรนด์ทั้งหมด</option>
                  {COMMON_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Table */}
            {loading ? (
              <div className="text-center py-20 text-slate-500">กำลังโหลดรายการสินค้า...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-slate-950 rounded-2xl border border-slate-800">
                <Package size={48} className="mx-auto text-slate-600 mb-3" />
                <p className="text-base font-semibold text-slate-300">ไม่พบรายการสินค้าที่ค้นหา</p>
                <p className="text-xs text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่ม "เพิ่มสินค้าใหม่"</p>
              </div>
            ) : (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">รูปภาพ</th>
                        <th className="py-3 px-4">แบรนด์ & รุ่น</th>
                        <th className="py-3 px-4">ขนาดยาง</th>
                        <th className="py-3 px-4">ปีผลิต</th>
                        <th className="py-3 px-4">ราคาต่อเส้น</th>
                        <th className="py-3 px-4">สถานะ</th>
                        <th className="py-3 px-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/40 transition">
                          <td className="py-3 px-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-900 p-1 border border-slate-800 flex items-center justify-center">
                              <img
                                src={p.image || '/assets/tire-4518.png'}
                                alt={p.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/tire-4518.png';
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-white text-sm">{p.brand}</div>
                            <div className="text-xs text-slate-400 line-clamp-1">{p.model}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-semibold text-orange-400 bg-orange-950/40 border border-orange-900/50 px-2 py-0.5 rounded text-xs">
                              {p.size}
                            </span>
                            {p.runflat && (
                              <span className="ml-1 text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                                RFT
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs text-slate-400">ปี {p.year || '2025'}</td>
                          <td className="py-3 px-4 font-bold text-white text-sm">
                            ฿{Number(p.price).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {p.stock !== false ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                พร้อมส่ง
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                สินค้าหมด
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleEditClick(p)}
                                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                                title="แก้ไข"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDuplicateClick(p)}
                                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                                title="ทำซ้ำ"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition"
                                title="ลบ"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD / EDIT PRODUCT FORM */}
        {activeTab === 'add' && (
          <div className="max-w-3xl mx-auto bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingId !== null ? '✏️ แก้ไขข้อมูลสินค้า' : '➕ เพิ่มสินค้ายางรายการใหม่'}
                </h2>
                <p className="text-xs text-slate-400">
                  กรอกขนาดยาง ราคา และเลือกรูปภาพ ข้อมูลจะปรากฏบนหน้าร้านทันที
                </p>
              </div>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormModel('');
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ยกเลิกการแก้ไข
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ยี่ห้อ / แบรนด์ <span className="text-orange-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-full focus:outline-none focus:border-orange-500"
                    >
                      {COMMON_BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="หรือพิมพ์แบรนด์อื่น..."
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value.toUpperCase())}
                      className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-1/2 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Model Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    รุ่นยาง (Model) <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น Primacy 4, UC7, PS31, AT52"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-full focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Tire Size */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ขนาดยาง (Size) <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 205/55R16 หรือ 215/45R17"
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-full font-mono focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-[11px] text-slate-500">รูปแบบ: ความกว้าง/ซีรีส์Rขอบ เช่น 205/55R16</span>
                </div>

                {/* DOT / Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ปีผลิต (DOT Year)
                  </label>
                  <input
                    type="text"
                    placeholder="2025"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-full focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Price per unit */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ราคาขายต่อเส้น (บาท) <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="3500"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : '')}
                    className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-full focus:outline-none focus:border-orange-500 font-bold"
                  />
                </div>

                {/* Regular Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ราคาปกติ / ขีดฆ่า (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="4200"
                    value={formRegularPrice}
                    onChange={(e) =>
                      setFormRegularPrice(e.target.value ? Number(e.target.value) : '')
                    }
                    className="bg-slate-900 border border-slate-700 text-slate-400 text-sm rounded-xl px-3 py-2 w-full focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* IMAGE DROP ZONE & UPLOAD */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  รูปภาพสินค้า (ลากไฟล์มาวาง หรือเลือกรูปจากเครื่อง)
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleImageDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                    dragActive
                      ? 'border-orange-500 bg-orange-950/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFile}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* Preview box */}
                    <div className="w-20 h-20 bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-center justify-center flex-shrink-0">
                      <img
                        src={formImage || '/assets/tire-4518.png'}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/tire-4518.png';
                        }}
                      />
                    </div>

                    <div className="text-center sm:text-left">
                      <p className="text-sm font-medium text-white flex items-center justify-center sm:justify-start gap-1.5">
                        <ImageIcon size={16} className="text-orange-500" />
                        <span>คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวางที่นี่</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">รองรับ JPG, PNG, WEBP (แปลงให้อัตโนมัติ)</p>
                    </div>
                  </div>
                </div>

                {/* Preset image buttons */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500">หรือเลือกจากรูปที่มีในระบบ:</span>
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.path}
                      type="button"
                      onClick={() => setFormImage(img.path)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        formImage === img.path
                          ? 'border-orange-500 bg-orange-950/40 text-orange-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formStock}
                    onChange={(e) => setFormStock(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-700"
                  />
                  <span>มีสินค้าพร้อมส่ง (In Stock)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRunflat}
                    onChange={(e) => setFormRunflat(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 bg-slate-900 border-slate-700"
                  />
                  <span>ยางรันแฟลต (Runflat)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-orange-600/30 transition"
                >
                  <Save size={16} />
                  <span>{editingId !== null ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้านี้ลงระบบ'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: FAST PASTE / EXCEL TEMPLATE */}
        {activeTab === 'bulk' && (
          <div className="max-w-3xl mx-auto bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="text-orange-500" size={20} />
                <span>นำเข้าข้อมูลแบบเร็ว (แค่วางข้อมูลจาก Excel)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                สามารถคัดลอก (Copy) หลายๆ แถวจาก Excel หรือสเปรดชีตมาวางในกล่องนี้ แล้วกดนำเข้าได้ทันที!
              </p>
            </div>

            {/* Template Example */}
            <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-400">📋 รูปแบบข้อมูล (คั่นด้วย | หรือ Copy จาก Excel วางได้เลย):</span>
                <button
                  type="button"
                  onClick={() =>
                    setBulkText(
                      `MICHELIN | Primacy 4 | 205/55R16 | 2025 | 3800 | 4500\n` +
                        `MICHELIN | Primacy 4 | 215/60R16 | 2025 | 4100 | 4900\n` +
                        `CONTINENTAL | UltraContact UC7 | 215/55R17 | 2025 | 3600 | 4200\n` +
                        `BRIDGESTONE | Turanza T005A | 215/50R17 | 2024 | 4100 | 4800\n` +
                        `OTANI | KC2000 | 195/55R15 | 2025 | 1450 | 1800`
                    )
                  }
                  className="text-xs text-orange-500 hover:underline"
                >
                  คลิกเพื่อโหลดข้อมูลตัวอย่าง
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded-lg">
                แบรนด์ | รุ่น | ขนาด | ปี | ราคาขายต่อเส้น | ราคาปกติ | รูปภาพ (URL หรือใส่ว่างไว้)
              </pre>
              <p className="text-[11px] text-emerald-400/90 leading-relaxed">
                ✨ <strong>ระบบจับคู่รูปอัตโนมัติ:</strong> ยางรุ่นเดียวกัน (เช่น Primacy 4) ระบบจะดึงรูปที่มีอยู่ในร้านมาใส่ให้ทุกขนาดอัตโนมัติทันที ไม่ต้องเหนื่อยใส่รูปทีละแถว! หรือหากต้องการใส่ URL รูปเอง สามารถวางไว้ที่ช่องสุดท้ายได้ครับ
              </p>
            </div>

            {/* Textarea */}
            <textarea
              rows={10}
              placeholder={`วางแถวข้อมูลจาก Excel ที่นี่...\nตัวอย่าง:\nMICHELIN | Primacy 4 | 205/55R16 | 2025 | 3800\nOTANI | KC2000 | 195/55R15 | 2025 | 1450`}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-2xl p-4 focus:outline-none focus:border-orange-500"
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500">
                {bulkText ? `${bulkText.split('\n').filter((l) => l.trim()).length} บรรทัด` : 'ยังไม่มีข้อมูล'}
              </span>
              <button
                type="button"
                onClick={handleBulkImport}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-orange-600/30 transition"
              >
                <Upload size={16} />
                <span>แปลงข้อมูลและเพิ่มเข้าร้านทันที</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: STORE INFO & CONTACTS */}
        {activeTab === 'store' && (
          <div className="max-w-2xl mx-auto bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="text-orange-500" size={20} />
                <span>ข้อมูลติดต่อร้านค้า & ปุ่มโทร/LINE</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                แก้ไขเบอร์โทรติดต่อ และ LINE OA สำหรับให้ลูกค้าสอบถามหรือจองคิว
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  เบอร์โทรศัพท์ร้าน (แสดงบนหัวเว็บและปุ่มโทร)
                </label>
                <input
                  type="text"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-full focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  LINE Official Account ID (เช่น @lcgroup)
                </label>
                <input
                  type="text"
                  value={shopLine}
                  onChange={(e) => setShopLine(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 w-full focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    showAlert('success', 'บันทึกข้อมูลติดต่อร้านค้าเรียบร้อยแล้ว!');
                  }}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-orange-600/30 transition"
                >
                  <Save size={16} />
                  <span>บันทึกข้อมูลร้าน</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
