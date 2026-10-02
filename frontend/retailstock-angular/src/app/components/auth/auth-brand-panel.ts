import { Component } from '@angular/core';
import { Boxes, LucideAngularModule, ScanBarcode, Truck, Warehouse } from 'lucide-angular';

@Component({
  selector: 'app-auth-brand-panel',
  imports: [LucideAngularModule],
  template: `
    <div
      class="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 relative overflow-hidden p-10 lg:flex shadow-2xl z-20"
    >
      <!-- Decorative Elements -->
      <div class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-white/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute -top-20 -left-20 w-64 h-64 bg-indigo-400/30 blur-[80px] rounded-full pointer-events-none"></div>

      <div class="flex items-center gap-3 text-xl font-black text-white z-10 tracking-tight">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-600 shadow-lg">
          <lucide-icon [img]="BoxesIcon" class="h-6 w-6" />
        </div>
        RetailStock
      </div>

      <div class="z-10">
        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-sm">
          Retail inventory,
          <br />
          finally under control.
        </h1>
        <ul class="mt-10 space-y-6">
          @for (f of features; track f.text) {
            <li class="flex items-center gap-4 text-indigo-100 font-medium">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-sm text-white">
                <lucide-icon [img]="f.icon" class="h-5 w-5" />
              </span>
              {{ f.text }}
            </li>
          }
        </ul>
      </div>

      <p class="text-xs text-indigo-200 font-medium z-10">© {{ year }} Retail Inventory Management</p>
    </div>
  `,
})
export class AuthBrandPanel {
  protected readonly BoxesIcon = Boxes;
  protected readonly year = new Date().getFullYear();
  protected readonly features = [
    { icon: Boxes, text: 'Track stock across every product variant' },
    { icon: Warehouse, text: 'Manage warehouses and storage locations' },
    { icon: Truck, text: 'Keep suppliers and purchasing in one place' },
    { icon: ScanBarcode, text: 'Full history of every stock movement' },
  ];
}
