import { formatCategoryLabel } from '../lib/exchange/currencyCategory'

interface ItemFilterProps {
  selectedItem: string
  itemOptions: string[]
  onChange: (value: string) => void
  selectedCategory: string
  categoryOptions: string[]
  onCategoryChange: (value: string) => void
}

export function ItemFilter({
  selectedItem,
  itemOptions,
  onChange,
  selectedCategory,
  categoryOptions,
  onCategoryChange,
}: ItemFilterProps) {
  return (
    <section className="control-card item-filter-card">
      <h3>Item Filter</h3>
      <p>Search and narrow opportunities by either market currency.</p>

      <label htmlFor="category-filter">Category</label>
      <select
        id="category-filter"
        value={selectedCategory}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        <option value="">All categories</option>
        {categoryOptions.map((category) => (
          <option key={category} value={category}>
            {formatCategoryLabel(category)}
          </option>
        ))}
      </select>

      <label htmlFor="item-filter">Currency</label>
      <input
        id="item-filter"
        type="text"
        list="currency-options"
        placeholder="e.g. divine, chaos, exalted"
        value={selectedItem}
        onChange={(event) => onChange(event.target.value.trim().toLowerCase())}
      />
      <datalist id="currency-options">
        {itemOptions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </section>
  )
}
