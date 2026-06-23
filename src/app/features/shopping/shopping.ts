import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../core/services/firestore';
import { ShoppingItem } from '../../core/models/recipe.interface';

@Component({
  selector: 'app-shopping',
  imports: [FormsModule],
  templateUrl: './shopping.html',
  styleUrl: './shopping.scss',
})
export class Shopping implements OnInit {
  private firestoreService = inject(FirestoreService);

  items = signal<ShoppingItem[]>([]);
  loading = signal(true);
  newItem = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.firestoreService.getShoppingList().subscribe((items) => {
      this.items.set(items);
      this.loading.set(false);
    });
  }

  async addItem(): Promise<void> {
    const name = this.newItem().trim();
    if (!name) return;
    this.newItem.set('');
    await this.firestoreService.addShoppingItems([name]);
    this.load();
  }

  async toggle(item: ShoppingItem): Promise<void> {
    const checked = !item.checked;
    this.items.update((list) => list.map((i) => (i.id === item.id ? { ...i, checked } : i)));
    await this.firestoreService.toggleShoppingItem(item.id, checked);
  }

  async remove(item: ShoppingItem): Promise<void> {
    this.items.update((list) => list.filter((i) => i.id !== item.id));
    await this.firestoreService.removeShoppingItem(item.id);
  }

  async clearChecked(): Promise<void> {
    this.items.update((list) => list.filter((i) => !i.checked));
    await this.firestoreService.clearCheckedShoppingItems();
  }

  get checkedCount(): number {
    return this.items().filter((i) => i.checked).length;
  }
}
