import { MenuItemForm } from "../menu-item-form";

export default function NewMenuItemPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 font-serif text-2xl font-semibold">Add menu item</h1>
      <MenuItemForm />
    </div>
  );
}
