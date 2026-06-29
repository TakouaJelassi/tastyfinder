import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ShoppingStore } from '../../core/stores/shopping.store';
import { NotificationService } from '../../core/services/notification';
import { ShoppingItem } from '../../core/models/recipe.interface';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'app-shopping',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './shopping.html',
  styleUrl: './shopping.scss',
})
export class Shopping implements OnInit {
  private shoppingStore = inject(ShoppingStore);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  items = signal<ShoppingItem[]>([]);
  loading = signal(true);
  newItem = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.shoppingStore
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        this.items.set(items);
        this.loading.set(false);
      });
  }

  async addItem(): Promise<void> {
    const name = this.newItem().trim();
    if (!name) return;
    this.newItem.set('');
    await this.shoppingStore.add([name]);
    this.notification.success(`"${name}" added`);
    this.load();
  }

  async toggle(item: ShoppingItem): Promise<void> {
    const checked = !item.checked;
    this.items.update((list) => list.map((i) => (i.id === item.id ? { ...i, checked } : i)));
    await this.shoppingStore.toggle(item.id, checked);
  }

  async remove(item: ShoppingItem): Promise<void> {
    this.items.update((list) => list.filter((i) => i.id !== item.id));
    await this.shoppingStore.remove(item.id);
  }

  async clearChecked(): Promise<void> {
    this.items.update((list) => list.filter((i) => !i.checked));
    await this.shoppingStore.clearChecked();
    this.notification.success('Checked items removed');
  }

  get checkedCount(): number {
    return this.items().filter((i) => i.checked).length;
  }
}
