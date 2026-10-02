import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LucideAngularModule, Boxes, LayoutDashboard, Package, Warehouse as WarehouseIcon, Truck, Users, Tags, ArrowDownToLine, ArrowUpFromLine, Plus, RefreshCw, LogOut, Menu, X, MapPin, Archive, Activity, Trash2, Ban, Lock } from 'lucide-angular';
import { AuthService } from '../core/auth.service';
import { ApiError, ApiService, Category, Inventory, MovementType, Product, ProductVariant, StockMovement, Supplier, SupplierProduct, User, Warehouse, WarehouseType } from '../core/api.service';

type Tab = 'overview' | 'products' | 'inventory' | 'movements' | 'warehouses' | 'categories' | 'suppliers' | 'users';
const blankAddress = () => ({ street: '', city: '', state: '', postalCode: '', country: '' });

@Component({
  selector: 'app-welcome-page',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <!-- Top App Bar -->
      <header class="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button class="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" (click)="mobileNav.set(!mobileNav())">
              <lucide-icon [img]="mobileNav() ? XIcon : MenuIcon" class="h-5 w-5" />
            </button>
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <lucide-icon [img]="BoxesIcon" class="h-6 w-6" />
              </div>
              <div class="hidden sm:block">
                <h1 class="text-xl font-bold tracking-tight text-slate-900 leading-none">RetailStock</h1>
                <p class="text-[10px] font-semibold tracking-widest uppercase text-indigo-500 mt-1">Workspace</p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="hidden md:flex flex-col items-end mr-2">
              <span class="text-sm font-bold text-slate-900">{{ fullName() || 'My Account' }}</span>
              <span class="text-xs font-medium text-slate-500">{{ auth.email() }}</span>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 border-2 border-indigo-100 text-indigo-700 font-bold shadow-sm">
              {{ (fullName() || auth.email() || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <button (click)="auth.logout()" class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
              <lucide-icon [img]="LogOutIcon" class="h-4 w-4" />
              <span class="hidden sm:block">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1 mx-auto w-full max-w-7xl lg:flex relative">
        <!-- Sidebar Navigation -->
        @if (mobileNav()) {
          <div class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity" (click)="mobileNav.set(false)"></div>
        }
        
        <aside class="fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 shadow-2xl lg:shadow-none lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 transition-transform duration-300 ease-in-out" 
               [class.-translate-x-full]="!mobileNav()" 
               [class.translate-x-0]="mobileNav()" 
               [class.lg:translate-x-0]="true">
          <div class="h-full overflow-y-auto px-4 py-6 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-6 lg:hidden">
                <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Main Menu</span>
                <button (click)="mobileNav.set(false)" class="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><lucide-icon [img]="XIcon" class="h-5 w-5" /></button>
              </div>
              
              <nav class="space-y-1.5">
                @for (item of nav; track item.id) {
                  <button (click)="select(item.id)" 
                          class="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
                          [class.bg-indigo-50]="tab() === item.id"
                          [class.text-indigo-700]="tab() === item.id"
                          [class.text-slate-600]="tab() !== item.id"
                          [class.hover:bg-slate-50]="tab() !== item.id"
                          [class.hover:text-slate-900]="tab() !== item.id">
                    <lucide-icon [img]="item.icon" class="h-5 w-5 transition-colors" [class.text-indigo-600]="tab() === item.id" [class.text-slate-400]="tab() !== item.id" [class.group-hover:text-slate-600]="tab() !== item.id" />
                    {{ item.label }}
                  </button>
                }
              </nav>
            </div>
            
            <div class="mt-8 rounded-2xl bg-slate-900 p-5 shadow-lg relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>
              <div class="relative z-10">
                <div class="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>
                  Live Connection
                </div>
                <p class="text-xs leading-relaxed text-slate-300 font-medium">Syncing data with Spring Boot backend.</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 min-w-0 bg-slate-50/50">
          <div class="px-4 py-8 sm:px-6 lg:px-8">
            <!-- Global Notifications -->
            <div class="mb-6 space-y-3">
              @if (error()) { <div class="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-sm animate-in fade-in slide-in-from-top-2"><span>{{ error() }}</span><button (click)="error.set('')" class="text-rose-500 hover:text-rose-700"><lucide-icon [img]="XIcon" class="h-4 w-4" /></button></div> }
              @if (notice()) { <div class="flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">{{ notice() }}</div> }
              @if (loading()) { <div class="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white px-4 py-3 text-sm font-medium text-indigo-700 shadow-sm"><lucide-icon [img]="RefreshIcon" class="h-4 w-4 animate-spin text-indigo-500" />Syncing data...</div> }
            </div>

            <!-- Tab Content -->
            @switch (tab()) {
            @case ('overview') { 
              <div class="space-y-8 animate-in fade-in duration-500">
                <!-- Dashboard Hero -->
                <div class="relative overflow-hidden rounded-3xl bg-indigo-900 p-8 sm:p-10 text-white shadow-xl shadow-indigo-200">
                  <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500 blur-3xl opacity-50"></div>
                  
                  <div class="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div class="max-w-xl">
                      <span class="inline-flex items-center rounded-full bg-indigo-800/80 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-sm border border-indigo-700/50 mb-4">{{ greeting() }}</span>
                      <h2 class="text-3xl md:text-5xl font-black tracking-tight mb-2">Welcome, {{ auth.user()?.firstName || 'User' }}.</h2>
                      <p class="text-indigo-200 text-lg md:text-xl font-medium leading-relaxed">Here's what's happening in your retail operations today.</p>
                    </div>
                    <button class="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-900 shadow-lg hover:bg-indigo-50 transition-all hover:scale-105" (click)="select('movements')">
                      <lucide-icon [img]="PlusIcon" class="h-5 w-5 text-indigo-600" />
                      New Movement
                    </button>
                  </div>
                </div>

                <!-- KPI Cards (Rearranged Order) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div class="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50"><lucide-icon [img]="WarehouseIcon" class="h-6 w-6" /></div>
                    <div><p class="text-sm font-semibold text-slate-500">Active Locations</p><p class="text-3xl font-black text-slate-900">{{ warehouses.length }}</p></div>
                  </div>
                  <div class="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
                    <div class="absolute bottom-0 left-0 h-1 w-full bg-rose-500" *ngIf="lowStockCount() > 0"></div>
                    <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-4 ring-rose-50/50"><lucide-icon [img]="ArchiveIcon" class="h-6 w-6" /></div>
                    <div><p class="text-sm font-semibold text-slate-500">Action Required</p><p class="text-3xl font-black text-slate-900">{{ lowStockCount() }}</p></div>
                  </div>
                  <div class="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/50"><lucide-icon [img]="PackageIcon" class="h-6 w-6" /></div>
                    <div><p class="text-sm font-semibold text-slate-500">Total Items</p><p class="text-3xl font-black text-slate-900">{{ products.length }}</p></div>
                  </div>
                  <div class="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-4 ring-amber-50/50"><lucide-icon [img]="TruckIcon" class="h-6 w-6" /></div>
                    <div><p class="text-sm font-semibold text-slate-500">Vendors</p><p class="text-3xl font-black text-slate-900">{{ suppliers.length }}</p></div>
                  </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <!-- Recent Activity Table -->
                  <div class="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
                      <div>
                        <h3 class="text-lg font-bold text-slate-900">Recent Movements</h3>
                        <p class="text-sm font-medium text-slate-500">Latest inventory changes</p>
                      </div>
                      <button class="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors" (click)="select('movements')">View All</button>
                    </div>
                    <div class="overflow-x-auto flex-1">
                      <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-slate-50 text-slate-500">
                          <tr><th class="px-6 py-3 font-semibold">Type</th><th class="px-6 py-3 font-semibold">Details</th><th class="px-6 py-3 font-semibold text-right">Qty</th><th class="px-6 py-3 font-semibold text-right">Balance</th></tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          @for (m of movements.slice(0,5); track m.id) {
                            <tr class="hover:bg-slate-50 transition-colors">
                              <td class="px-6 py-4">
                                <span class="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold" [class.bg-emerald-100]="isInbound(m.movementType)" [class.text-emerald-800]="isInbound(m.movementType)" [class.bg-rose-100]="!isInbound(m.movementType)" [class.text-rose-800]="!isInbound(m.movementType)">
                                  {{ label(m.movementType) }}
                                </span>
                              </td>
                              <td class="px-6 py-4">
                                <div class="font-bold text-slate-900">{{ productName(m.productId) }}</div>
                                <div class="text-xs text-slate-500 mt-0.5 flex items-center gap-1"><lucide-icon [img]="MapPinIcon" class="h-3 w-3" /> {{ warehouseName(m.warehouseId) }}</div>
                              </td>
                              <td class="px-6 py-4 text-right font-black text-slate-900">{{ m.quantity }}</td>
                              <td class="px-6 py-4 text-right font-medium text-slate-500">{{ m.balanceAfter ?? '—' }}</td>
                            </tr>
                          } @empty {
                            <tr><td colspan="4" class="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">No stock movements recorded yet.</td></tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <!-- Profile Widget -->
                  <div class="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                    <div class="h-24 bg-gradient-to-r from-indigo-500 to-violet-600"></div>
                    <div class="px-6 pb-6 flex-1 flex flex-col relative">
                      <div class="absolute -top-10 left-6 h-20 w-20 rounded-2xl bg-white p-1 shadow-lg border border-slate-100">
                        <div class="flex h-full w-full items-center justify-center rounded-xl bg-indigo-50 text-2xl font-black text-indigo-600">
                          {{ (fullName() || auth.email() || '?').charAt(0).toUpperCase() }}
                        </div>
                      </div>
                      
                      <div class="mt-14 mb-6">
                        <h3 class="text-xl font-bold text-slate-900">{{ fullName() || 'My Account' }}</h3>
                        <p class="text-sm font-medium text-slate-500">{{ auth.email() }}</p>
                      </div>
                      
                      <div class="space-y-4 flex-1">
                        <div>
                          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Assigned Roles</p>
                          <div class="flex flex-wrap gap-2">
                            @for (role of auth.user()?.roles ?? []; track role) {
                              <span class="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">{{ label(role) }}</span>
                            } @empty {
                              <span class="text-sm text-slate-400 italic">No specific roles</span>
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div class="mt-6 rounded-xl bg-indigo-50 p-4 border border-indigo-100/50">
                        <div class="flex gap-3">
                          <lucide-icon [img]="LockIcon" class="h-5 w-5 text-indigo-500 shrink-0" />
                          <p class="text-xs font-medium text-indigo-900/80 leading-relaxed">Secure session active. Token expires in 2 hours automatically.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            @case ('products') { <section><ng-container *ngTemplateOutlet="pageHead; context: { title: 'Catalogue Control', desc: 'Manage your product catalogue and associated SKU variants.' }"></ng-container><div class="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><section class="panel"><div class="panel-header"><div><h2>Catalogue Listing</h2><p>{{ products.length }} total items registered</p></div><button class="icon-button" (click)="load()" title="Refresh"><lucide-icon [img]="RefreshIcon" /></button></div><div class="overflow-x-auto"><table><thead><tr><th>Category</th><th>Product Details</th><th>Price</th><th>System Status</th><th>Actions</th></tr></thead><tbody>@for (p of products; track p.id) {<tr><td><span class="badge badge-indigo">{{ p.category?.name || categoryName(p.category?.id) }}</span></td><td><div class="font-semibold text-slate-900">{{ p.name }}</div><div class="text-xs text-slate-500">Ref: {{ p.sku }}</div></td><td class="font-bold">{{ p.basePrice | currency:'INR':'symbol':'1.2-2' }}</td><td><span class="badge" [class.badge-green]="p.active" [class.badge-gray]="!p.active">{{ p.active ? 'Active' : 'Archived' }}</span></td><td><button class="danger-link" [disabled]="!p.active" (click)="deactivateProduct(p)"><lucide-icon [img]="BanIcon" />Suspend</button></td></tr>} @empty {<tr><td colspan="5" class="empty">Please set up a category to add products.</td></tr>}</tbody></table></div></section><section class="panel"><div class="panel-header"><div><h2>Register Product</h2><p>Provide product details.</p></div></div><form class="form-grid p-5" (ngSubmit)="saveProduct()"><label>Product Name<input [(ngModel)]="draft.product.name" name="pname" required></label><label>Assigned Category<select [(ngModel)]="draft.product.categoryId" name="pcat" required><option [ngValue]="null">Choose...</option>@for (c of categories; track c.id) {<option [ngValue]="c.id">{{ c.name }}</option>}</select></label><label>SKU / Identifier<input [(ngModel)]="draft.product.sku" name="psku" required></label><label>Initial Base Price<input [(ngModel)]="draft.product.basePrice" name="pprice" type="number" min="0" step="0.01" required></label><label class="sm:col-span-2">Detailed Description<textarea [(ngModel)]="draft.product.description" name="pdesc" rows="3"></textarea></label><button class="action-primary sm:col-span-2" type="submit"><lucide-icon [img]="PlusIcon" class="h-4 w-4" />Register Product</button></form></section></div><section class="panel mt-6"><div class="panel-header"><div><h2>Variant Configurator</h2><p>Set up multi-level variants.</p></div></div><form class="form-grid border-b border-slate-100 p-5" (ngSubmit)="saveVariant()"><label>Parent Product<select [(ngModel)]="draft.variant.productId" name="vproduct" required><option [ngValue]="null">Select parent</option>@for (p of products; track p.id) {<option [ngValue]="p.id">{{ p.name }} ({{ p.sku }})</option>}</select></label><label>Variant Name<input [(ngModel)]="draft.variant.name" name="vname" required></label><label>Variant SKU<input [(ngModel)]="draft.variant.sku" name="vsku" required></label><label>Override Price<input [(ngModel)]="draft.variant.price" name="vprice" type="number" min="0" step="0.01" required></label><button class="action-primary sm:col-span-2" type="submit">Register Variant</button></form><div class="overflow-x-auto"><table><thead><tr><th>Product Link</th><th>Variant Name</th><th>SKU code</th><th>Pricing</th><th>State</th><th></th></tr></thead><tbody>@for (v of variants; track v.id) {<tr><td class="font-semibold">{{ productName(v.productId) }}</td><td>{{ v.name }}</td><td><code class="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{{ v.sku }}</code></td><td>{{ v.price | currency:'INR':'symbol':'1.2-2' }}</td><td><span class="badge" [class.badge-green]="v.active" [class.badge-gray]="!v.active">{{ v.active ? 'Active' : 'Archived' }}</span></td><td><button class="danger-link" [disabled]="!v.active" (click)="deactivateVariant(v)"><lucide-icon [img]="BanIcon" />Archive</button></td></tr>} @empty {<tr><td colspan="6" class="empty">No active variants found.</td></tr>}</tbody></table></div></section></section> }
            @case ('inventory') { <section><ng-container *ngTemplateOutlet="pageHead; context: { title: 'Stock Ledger', desc: 'Real-time monitoring of quantity states across all registered warehouses.' }"></ng-container><div class="grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><section class="panel"><div class="panel-header"><div><h2>Live Stock Tracking</h2><p>{{ inventory.length }} tracked units</p></div></div><div class="overflow-x-auto"><table><thead><tr><th>Location</th><th>Item Name</th><th>Incoming</th><th>Reserved</th><th>Available</th><th>Actions</th></tr></thead><tbody>@for (i of inventory; track i.id) {<tr><td><div class="flex items-center gap-2"><lucide-icon [img]="WarehouseIcon" class="h-4 w-4 text-slate-400" /><span class="font-semibold">{{ warehouseName(i.warehouseId) }}</span></div></td><td class="font-medium text-slate-700">{{ productName(i.productId) }}</td><td><span class="badge badge-indigo">{{ i.quantityIncoming }}</span></td><td><span class="badge badge-gray">{{ i.quantityReserved }}</span></td><td><span [class.text-rose-600]="i.quantityOnHand < 10" [class.text-emerald-600]="i.quantityOnHand >= 10" class="font-black text-lg">{{ i.quantityOnHand }}</span></td><td><button class="danger-link" (click)="deleteInventory(i)"><lucide-icon [img]="TrashIcon" />Remove</button></td></tr>} @empty {<tr><td colspan="6" class="empty">Inventory balances are empty.</td></tr>}</tbody></table></div></section><section class="panel"><div class="panel-header"><div><h2>Initialize Ledger</h2><p>Set base balances for locations.</p></div></div><form class="form-grid p-5" (ngSubmit)="saveInventory()"><label>Location (Warehouse)<select [(ngModel)]="draft.inventory.warehouseId" name="iwarehouse" required><option [ngValue]="null">Select location...</option>@for (w of warehouses; track w.id) {<option [ngValue]="w.id">{{ w.name }}</option>}</select></label><label>Target Product<select [(ngModel)]="draft.inventory.productId" name="iproduct" required><option [ngValue]="null">Select item...</option>@for (p of products; track p.id) {<option [ngValue]="p.id">{{ p.name }}</option>}</select></label><label>Incoming Supply<input [(ngModel)]="draft.inventory.quantityIncoming" name="iincoming" type="number" min="0"></label><label>Reserved Quantity<input [(ngModel)]="draft.inventory.quantityReserved" name="ireserved" type="number" min="0"></label><label class="sm:col-span-2">On-Hand Quantity<input [(ngModel)]="draft.inventory.quantityOnHand" name="ionhand" type="number" min="0" class="border-indigo-300 bg-indigo-50 font-bold"></label><button class="action-primary sm:col-span-2" type="submit">Save Ledger Entry</button></form></section></div></section> }
            @case ('movements') { <section><ng-container *ngTemplateOutlet="pageHead; context: { title: 'Movement Operations', desc: 'Monitor and execute stock adjustments, transfers, and corrections.' }"></ng-container><div class="grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><section class="panel"><div class="panel-header"><div><h2>Activity Log</h2><p>Immutable ledger of all warehouse activity.</p></div></div><div class="overflow-x-auto"><table><thead><tr><th>Timestamp</th><th>Operation</th><th>Warehouse / Item</th><th>Ref.</th><th>Volume</th><th>Final Balance</th></tr></thead><tbody>@for (m of movements; track m.id) {<tr><td class="whitespace-nowrap text-xs font-medium text-slate-500">{{ m.occurredAt | date:'short' }}</td><td><span class="badge" [class.badge-green]="isInbound(m.movementType)" [class.badge-red]="!isInbound(m.movementType)">{{ label(m.movementType) }}</span></td><td><div class="font-bold text-slate-800">{{ warehouseName(m.warehouseId) }}</div><div class="text-xs text-indigo-600">{{ productName(m.productId) }}</div></td><td><span class="text-xs bg-slate-100 rounded px-1.5 py-0.5 border border-slate-200">{{ m.referenceType || 'N/A' }} #{{ m.referenceId || '--' }}</span></td><td class="font-black text-slate-900">{{ m.quantity }}</td><td class="font-bold text-slate-600">{{ m.balanceAfter }}</td></tr>} @empty {<tr><td colspan="6" class="empty">No log records yet.</td></tr>}</tbody></table></div></section><section class="panel"><div class="panel-header"><div><h2>Post Movement</h2><p>All operations are logged automatically.</p></div></div><form class="form-grid p-5" (ngSubmit)="saveMovement()"><label class="sm:col-span-2">Operation Type<select [(ngModel)]="draft.movement.movementType" name="mtype" required class="font-semibold text-indigo-900 bg-indigo-50 border-indigo-200">@for (type of movementTypes; track type) {<option [ngValue]="type">{{ label(type) }}</option>}</select></label><label>Target Warehouse<select [(ngModel)]="draft.movement.warehouseId" name="mwarehouse" required><option [ngValue]="null">Choose...</option>@for (w of warehouses; track w.id) {<option [ngValue]="w.id">{{ w.name }}</option>}</select></label><label>Product<select [(ngModel)]="draft.movement.productId" name="mproduct" required><option [ngValue]="null">Choose...</option>@for (p of products; track p.id) {<option [ngValue]="p.id">{{ p.name }}</option>}</select></label><label class="sm:col-span-2">Operation Volume (Qty)<input [(ngModel)]="draft.movement.quantity" name="mquantity" type="number" min="1" required class="font-black text-lg"></label><label>Ref Document<input [(ngModel)]="draft.movement.referenceType" name="mref" placeholder="e.g. Invoice"></label><label>Ref Code<input [(ngModel)]="draft.movement.referenceId" name="mrefid" type="number"></label><label class="sm:col-span-2">Notes / Justification<textarea [(ngModel)]="draft.movement.reason" name="mreason" rows="2"></textarea></label><button class="action-primary sm:col-span-2" type="submit">Commit Operation</button></form></section></div></section> }
            @case ('warehouses') { <section><ng-container *ngTemplateOutlet="pageHead; context: { title: 'Distribution Network', desc: 'Oversee physical hubs, retail fronts, and handling facilities.' }"></ng-container><div class="grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><section class="panel"><div class="panel-header"><div><h2>Hub Directory</h2><p>{{ warehouses.length }} registered zones</p></div></div><div class="grid gap-4 p-5 sm:grid-cols-2">@for (w of warehouses; track w.id) {<article class="rounded-xl border-l-4 border-l-indigo-500 border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"><div class="flex items-start justify-between mb-2"><span class="badge badge-indigo text-[10px]">{{ w.type }}</span><p class="text-xs font-bold font-mono tracking-wider text-slate-400">{{ w.code }}</p></div><h3 class="text-lg font-black text-slate-800">{{ w.name }}</h3><p class="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500 bg-slate-50 p-2 rounded-lg"><lucide-icon [img]="MapPinIcon" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />{{ addressText(w.address) }}</p><div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between"><span class="badge" [class.badge-green]="w.active" [class.badge-gray]="!w.active">{{ w.active ? 'Operational' : 'Closed' }}</span><button class="danger-link" [disabled]="!w.active" (click)="deactivateWarehouse(w)"><lucide-icon [img]="BanIcon" />Close</button></div></article>} @empty {<p class="empty sm:col-span-2">No facilities managed yet.</p>}</div></section><section class="panel"><div class="panel-header"><div><h2>Register Facility</h2><p>Create a new hub or store.</p></div></div><form class="form-grid p-5" (ngSubmit)="saveWarehouse()"><label>Facility Name<input [(ngModel)]="draft.warehouse.name" name="wname" required></label><label>Facility Code<input [(ngModel)]="draft.warehouse.code" name="wcode" required></label><label class="sm:col-span-2">Classification<select [(ngModel)]="draft.warehouse.type" name="wtype" required>@for (type of warehouseTypes; track type) {<option [ngValue]="type">{{ label(type) }}</option>}</select></label><div class="col-span-2 mt-2 mb-1 border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-widest text-indigo-500">Address Data</div><label class="sm:col-span-2">Street<input [(ngModel)]="draft.warehouse.address.street" name="wstreet"></label><label>City<input [(ngModel)]="draft.warehouse.address.city" name="wcity"></label><label>State/Region<input [(ngModel)]="draft.warehouse.address.state" name="wstate"></label><label>Country<input [(ngModel)]="draft.warehouse.address.country" name="wcountry"></label><label>Postal Code<input [(ngModel)]="draft.warehouse.address.postalCode" name="wpostal"></label><button class="action-primary sm:col-span-2 mt-2" type="submit">Create Facility</button></form></section></div></section> }
            @case ('categories') { <section><ng-container *ngTemplateOutlet="pageHead; context: { title: 'Product Classifications', desc: 'Manage your taxonomy and taxonomy structures.' }"></ng-container><div class="grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><section class="panel"><div class="panel-header"><div><h2>Taxonomy List</h2><p>{{ categories.length }} registered groups</p></div></div><div class="overflow-x-auto"><table><thead><tr><th>Group Name</th><th>Details / Specs</th><th>Condition</th><th></th></tr></thead><tbody>@for (c of categories; track c.id) {<tr><td class="font-bold text-slate-800">{{ c.name }}</td><td class="text-slate-500 italic">{{ c.description || 'No description provided' }}</td><td><span class="badge" [class.badge-green]="c.active" [class.badge-gray]="!c.active">{{ c.active ? 'Available' : 'Deprecated' }}</span></td><td class="text-right"><button class="danger-link" [disabled]="!c.active" (click)="deactivateCategory(c)"><lucide-icon [img]="BanIcon" />Deprecate</button></td></tr>} @empty {<tr><td colspan="4" class="empty">Taxonomy is empty.</td></tr>}</tbody></table></div></section><section class="panel"><div class="panel-header"><div><h2>Create Group</h2><p>Add a new classification group.</p></div></div><form class="form-grid p-5" (ngSubmit)="saveCategory()"><label class="sm:col-span-2">Group Title<input [(ngModel)]="draft.category.name" name="cname" required class="text-lg font-bold"></label><label class="sm:col-span-2">Descriptive Text<textarea [(ngModel)]="draft.category.description" name="cdesc" rows="4"></textarea></label><button class="action-primary sm:col-span-2" type="submit">Save Group</button></form></section></div></section> }
            @case ('suppliers') { <section><ng-container *ngTemplateOutlet="pageHead; context: { title: 'Sourcing & Vendors', desc: 'Oversee supply chain partners and cost-per-product linkages.' }"></ng-container><div class="grid gap-6 xl:grid-cols-[1.15fr_.85fr]"><section class="panel"><div class="panel-header"><div><h2>Vendor Roster</h2><p>{{ suppliers.length }} active profiles</p></div></div><div class="overflow-x-auto"><table><thead><tr><th>Vendor Info</th><th>Contact Channels</th><th>Terms</th><th>Score</th><th></th></tr></thead><tbody>@for (s of suppliers; track s.id) {<tr><td><div class="font-bold text-slate-900">{{ s.name }}</div><code class="text-[10px] text-indigo-500 uppercase tracking-widest">{{ s.code }}</code></td><td><div class="text-sm font-medium">{{ s.email || '—' }}</div><div class="text-xs text-slate-400 mt-1">{{ s.phoneNo || 'No phone' }}</div></td><td><div class="font-medium text-slate-700">{{ s.paymentTerms || 'N/A' }}</div><div class="text-xs text-amber-600 font-bold mt-1">{{ s.leadTimeDays ? s.leadTimeDays + ' day lead' : '—' }}</div></td><td><span class="flex items-center gap-1 font-black text-slate-800"><lucide-icon [img]="ActivityIcon" class="h-3 w-3 text-amber-400" /> {{ s.rating ?? '—' }}</span></td><td class="text-right"><button class="danger-link" (click)="deleteSupplier(s)"><lucide-icon [img]="TrashIcon" />Remove</button></td></tr>} @empty {<tr><td colspan="5" class="empty">Partner network is empty.</td></tr>}</tbody></table></div></section><section class="panel"><div class="panel-header"><div><h2>Onboard Vendor</h2><p>Submit profile to registry.</p></div></div><form class="form-grid p-5" (ngSubmit)="saveSupplier()"><label class="sm:col-span-2">Company Name<input [(ngModel)]="draft.supplier.name" name="sname" required></label><label>Vendor Code<input [(ngModel)]="draft.supplier.code" name="scode" required></label><label>Score Rating<input [(ngModel)]="draft.supplier.rating" name="srating" type="number" min="0" max="5" step="0.1"></label><label>Primary Email<input [(ngModel)]="draft.supplier.email" name="semail" type="email"></label><label>Phone Number<input [(ngModel)]="draft.supplier.phoneNo" name="sphone"></label><label>SLA Lead (Days)<input [(ngModel)]="draft.supplier.leadTimeDays" name="sdays" type="number" min="0"></label><label>Finance Terms<input [(ngModel)]="draft.supplier.paymentTerms" name="sterms"></label><button class="action-primary sm:col-span-2 mt-2" type="submit">Onboard Vendor</button></form></section></div><section class="panel mt-6"><div class="panel-header"><div><h2>Product Sourcing Binds</h2><p>Attach vendor costs to products.</p></div></div><div class="grid xl:grid-cols-[.4fr_.6fr]"><form class="form-grid border-r border-slate-100 p-5" (ngSubmit)="saveSupplierProduct()"><label class="sm:col-span-2">Select Vendor<select [(ngModel)]="draft.supplierProduct.supplierId" name="spsupplier" required><option [ngValue]="null">Choose...</option>@for (s of suppliers; track s.id) {<option [ngValue]="s.id">{{ s.name }}</option>}</select></label><label class="sm:col-span-2">Select Product<select [(ngModel)]="draft.supplierProduct.productId" name="spproduct" required><option [ngValue]="null">Choose...</option>@for (p of products; track p.id) {<option [ngValue]="p.id">{{ p.name }}</option>}</select></label><label>Cost (Per Unit)<input [(ngModel)]="draft.supplierProduct.unitCost" name="spcost" type="number" min="0" step="0.01" required></label><label>Min. Order Qty<input [(ngModel)]="draft.supplierProduct.moq" name="spmoq" type="number" min="1" required></label><button class="action-primary sm:col-span-2 mt-3" type="submit">Create Bind</button></form><div class="overflow-x-auto"><table class="border-none"><thead><tr><th>Product Bind</th><th>Vendor</th><th>Cost</th><th>Minimums</th><th></th></tr></thead><tbody>@for (sp of supplierProducts; track sp.id) {<tr><td class="font-bold text-indigo-700">{{ productName(sp.productId) }}</td><td class="font-medium text-slate-700">{{ supplierName(sp.supplierId) }}</td><td class="font-black">{{ sp.unitCost | currency:'INR':'symbol':'1.2-2' }}</td><td><span class="badge badge-gray">MOQ: {{ sp.moq }}</span></td><td class="text-right"><button class="icon-button border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600" (click)="deleteSupplierProduct(sp)"><lucide-icon [img]="TrashIcon" /></button></td></tr>} @empty {<tr><td colspan="5" class="empty">No sourcing binds created.</td></tr>}</tbody></table></div></div></section></section> }
            @case ('users') { <section><ng-container *ngTemplateOutlet="pageHead; context: { title: 'System Security', desc: 'Manage role assignments and user access controls.' }"></ng-container><section class="panel"><div class="panel-header"><div><h2>Access Roster</h2><p>Only users with ADMIN rights can manipulate access statuses.</p></div><button class="icon-button" (click)="load()"><lucide-icon [img]="RefreshIcon" /></button></div><div class="overflow-x-auto"><table><thead><tr><th>Staff Member</th><th>Role Privileges</th><th>Contact Endpoint</th><th>Account State</th><th>Security Controls</th></tr></thead><tbody>@for (u of users; track u.id) {<tr><td><div class="font-bold text-slate-900">{{ u.firstName }} {{ u.lastName }}</div><div class="text-xs text-slate-400 font-mono mt-0.5">UID: {{ u.id }}</div></td><td><div class="flex flex-wrap gap-1">@for (r of u.roles ?? []; track r) {<span class="badge badge-indigo shadow-sm">{{ label(r) }}</span>}</div></td><td><div class="font-medium text-slate-600">{{ u.email }}</div><div class="text-xs text-slate-400">{{ u.phoneNo || 'No phone set' }}</div></td><td><span class="badge" [class.badge-green]="u.active" [class.badge-red]="!u.active">{{ u.active ? 'Verified' : 'Blocked' }}</span></td><td class="text-right">@if (canManageUsers()) { <button class="danger-link" [disabled]="!u.active" (click)="deactivateUser(u)"><lucide-icon [img]="LockIcon" />Revoke Access</button> } @else { <span class="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">Restricted</span> }</td></tr>} @empty {<tr><td colspan="5" class="empty">No roster data returned.</td></tr>}</tbody></table></div></section></section> }
          }
          </div>
        </main>
      </div>
    </div>
    
    <!-- Shared Page Header Template -->
    <ng-template #pageHead let-title="title" let-desc="desc">
      <div class="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end animate-in fade-in slide-in-from-bottom-2">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div class="h-2 w-2 rounded-full bg-indigo-500"></div>
            <p class="text-xs font-bold uppercase tracking-widest text-indigo-600">Module</p>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">{{ title }}</h1>
          <p class="mt-2 text-base font-medium text-slate-500">{{ desc }}</p>
        </div>
        <button class="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all active:scale-95" (click)="load()" title="Refresh data">
          <lucide-icon [img]="RefreshIcon" class="h-4 w-4" />
          Refresh
        </button>
      </div>
    </ng-template>
  `,
})
export class WelcomePage {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  protected readonly tab = signal<Tab>('overview');
  protected readonly mobileNav = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly fullName = computed(() => { const u = this.auth.user(); return u ? `${u.firstName} ${u.lastName}` : ''; });
  protected readonly canManageUsers = computed(() => (this.auth.user()?.roles ?? []).includes('ADMIN'));
  protected readonly greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; });
  protected readonly nav = [{ id: 'overview' as Tab, label: 'Platform Dashboard', icon: LayoutDashboard }, { id: 'movements' as Tab, label: 'Operations Log', icon: Activity }, { id: 'inventory' as Tab, label: 'Stock Ledger', icon: Archive }, { id: 'products' as Tab, label: 'Catalogue Control', icon: Package }, { id: 'categories' as Tab, label: 'Taxonomy', icon: Tags }, { id: 'warehouses' as Tab, label: 'Distribution Hubs', icon: WarehouseIcon }, { id: 'suppliers' as Tab, label: 'Vendors & Sourcing', icon: Truck }, { id: 'users' as Tab, label: 'System Security', icon: Users }];
  protected readonly movementTypes: MovementType[] = ['INBOUND', 'OUTBOUND', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'COUNT_CORRECTION'];
  protected readonly warehouseTypes: WarehouseType[] = ['DC', 'STORE', 'RETURNS'];
  protected readonly BoxesIcon = Boxes; protected readonly PackageIcon = Package; protected readonly WarehouseIcon = WarehouseIcon; protected readonly TruckIcon = Truck; protected readonly PlusIcon = Plus; protected readonly RefreshIcon = RefreshCw; protected readonly LogOutIcon = LogOut; protected readonly MenuIcon = Menu; protected readonly XIcon = X; protected readonly MapPinIcon = MapPin; protected readonly ArchiveIcon = Archive; protected readonly ActivityIcon = Activity; protected readonly TrashIcon = Trash2; protected readonly BanIcon = Ban; protected readonly LockIcon = Lock;
  protected products: Product[] = []; protected variants: ProductVariant[] = []; protected categories: Category[] = []; protected warehouses: Warehouse[] = []; protected suppliers: Supplier[] = []; protected inventory: Inventory[] = []; protected movements: StockMovement[] = []; protected supplierProducts: SupplierProduct[] = []; protected users: User[] = [];
  protected draft: any = { product: { sku: '', name: '', description: '', basePrice: 0, categoryId: null }, variant: { sku: '', name: '', description: '', price: 0, productId: null }, category: { name: '', description: '' }, warehouse: { code: '', name: '', type: 'DC', address: blankAddress() }, supplier: { code: '', name: '', email: '', phoneNo: '', paymentTerms: '', leadTimeDays: 0, rating: 0 }, inventory: { productId: null, warehouseId: null, quantityOnHand: 0, quantityReserved: 0, quantityIncoming: 0 }, movement: { productId: null, warehouseId: null, movementType: 'INBOUND', quantity: 1, referenceType: '', referenceId: null, reason: '' }, supplierProduct: { supplierId: null, productId: null, unitCost: 0, moq: 1 } };
  constructor() { this.load(); }
  protected select(tab: Tab) { this.tab.set(tab); this.mobileNav.set(false); this.notice.set(''); }
  protected async load(showError = true) { const token = this.auth.token(); if (!token) return; this.loading.set(true); if (showError) this.error.set(''); try { const result = await Promise.all([firstValueFrom(this.api.products(token)), firstValueFrom(this.api.variants(token)), firstValueFrom(this.api.categories(token)), firstValueFrom(this.api.warehouses(token)), firstValueFrom(this.api.suppliers(token)), firstValueFrom(this.api.inventory(token)), firstValueFrom(this.api.movements(token)), firstValueFrom(this.api.supplierProducts(token)), firstValueFrom(this.api.getAllUsers(token))]); [this.products, this.variants, this.categories, this.warehouses, this.suppliers, this.inventory, this.movements, this.supplierProducts, this.users] = result; } catch (e) { const err = e as ApiError; if (err.status === 401 || err.status === 403) this.auth.logout(); else if (showError) this.error.set(err.message); } finally { this.loading.set(false); } }
  private async save(task: () => import('rxjs').Observable<unknown>, message: string) { this.loading.set(true); this.error.set(''); this.notice.set(''); try { await new Promise<void>((resolve, reject) => task().subscribe({ next: () => resolve(), error: reject })); this.notice.set(message); await this.load(false); } catch (e) { this.error.set((e as ApiError).message); } finally { this.loading.set(false); } }
  private token() { return this.auth.token() || ''; }
  protected saveCategory() { const d = this.draft.category; if (!d.name.trim()) return this.error.set('Category name is required.'); return this.save(() => this.api.createCategory({ name: d.name.trim(), description: d.description?.trim() }, this.token()), 'Category created successfully.'); }
  protected saveProduct() { const d = this.draft.product; if (!d.sku || !d.name || !d.categoryId) return this.error.set('SKU, name, price, and category are required.'); return this.save(() => this.api.createProduct({ sku: d.sku, name: d.name, description: d.description, basePrice: Number(d.basePrice), categoryId: Number(d.categoryId), brandId: null }, this.token()), 'Product created successfully.'); }
  protected saveVariant() { const d = this.draft.variant; if (!d.sku || !d.name || !d.productId) return this.error.set('Variant SKU, name, price, and product are required.'); return this.save(() => this.api.createVariant({ sku: d.sku, name: d.name, description: d.description, price: Number(d.price), productId: { id: Number(d.productId) } }, this.token()), 'Variant created successfully.'); }
  protected saveWarehouse() { const d = this.draft.warehouse; if (!d.code || !d.name) return this.error.set('Warehouse code and name are required.'); return this.save(() => this.api.createWarehouse({ code: d.code, name: d.name, type: d.type, address: d.address }, this.token()), 'Warehouse created successfully.'); }
  protected saveSupplier() { const d = this.draft.supplier; if (!d.code || !d.name) return this.error.set('Supplier code and name are required.'); return this.save(() => this.api.createSupplier({ ...d, leadTimeDays: Number(d.leadTimeDays), rating: Number(d.rating) }, this.token()), 'Supplier created successfully.'); }
  protected saveInventory() { const d = this.draft.inventory; if (!d.productId || !d.warehouseId) return this.error.set('Select both product and warehouse.'); return this.save(() => this.api.createInventory({ ...d, productId: Number(d.productId), warehouseId: Number(d.warehouseId), quantityOnHand: Number(d.quantityOnHand), quantityReserved: Number(d.quantityReserved), quantityIncoming: Number(d.quantityIncoming) }, this.token()), 'Inventory item created successfully.'); }
  protected saveMovement() { const d = this.draft.movement; if (!d.productId || !d.warehouseId || !d.quantity) return this.error.set('Select product, warehouse, movement type, and quantity.'); return this.save(() => this.api.createMovement({ ...d, productId: Number(d.productId), warehouseId: Number(d.warehouseId), quantity: Number(d.quantity), performedBy: this.auth.user()?.id ?? null }, this.token()), 'Stock movement recorded successfully.'); }
  protected saveSupplierProduct() { const d = this.draft.supplierProduct; if (!d.supplierId || !d.productId) return this.error.set('Select supplier and product.'); return this.save(() => this.api.createSupplierProduct({ supplierId: Number(d.supplierId), productId: Number(d.productId), unitCost: Number(d.unitCost), moq: Number(d.moq) }, this.token()), 'Supplier-product relationship created successfully.'); }
  protected deactivateProduct(p: Product) { return this.save(() => this.api.deactivateProduct(p.id!, this.token()), 'Product deactivated.'); }
  protected deactivateVariant(v: ProductVariant) { return this.save(() => this.api.deactivateVariant(v.id!, this.token()), 'Variant deactivated.'); }
  protected deactivateCategory(c: Category) { return this.save(() => this.api.deactivateCategory(c.id!, this.token()), 'Category deactivated.'); }
  protected deactivateWarehouse(w: Warehouse) { return this.save(() => this.api.deactivateWarehouse(w.id!, this.token()), 'Warehouse deactivated.'); }
  protected deleteSupplier(s: Supplier) { return this.save(() => this.api.deleteSupplier(s.id!, this.token()), 'Supplier deleted.'); }
  protected deleteInventory(i: Inventory) { return this.save(() => this.api.deleteInventory(i.id!, this.token()), 'Inventory item deleted.'); }
  protected deleteSupplierProduct(sp: SupplierProduct) { return this.save(() => this.api.deleteSupplierProduct(sp.id!, this.token()), 'Supplier-product relationship deleted.'); }
  protected deactivateUser(u: User) { return this.save(() => this.api.deactivateUser(u.id!, this.token()), 'User deactivated.'); }
  protected label(value: string) { return value.replaceAll('_', ' '); }
  protected isInbound(value: MovementType) { return ['INBOUND', 'TRANSFER_IN', 'RETURN'].includes(value); }
  protected productName(id?: number) { return this.products.find(p => p.id === id)?.name || `Product #${id ?? '—'}`; }
  protected categoryName(id?: number) { return this.categories.find(c => c.id === id)?.name || `Category #${id ?? '—'}`; }
  protected supplierName(id?: number) { return this.suppliers.find(s => s.id === id)?.name || `Supplier #${id ?? '—'}`; }
  protected warehouseName(id?: number) { return this.warehouses.find(w => w.id === id)?.name || `Warehouse #${id ?? '—'}`; }
  protected addressText(address?: Warehouse['address']) { return address ? [address.street, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ') || 'Address not provided' : 'Address not provided'; }
  protected lowStockCount() { return this.inventory.filter(i => i.quantityOnHand < 10).length; }
}
