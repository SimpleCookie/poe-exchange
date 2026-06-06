interface ItemFilterProps {
  selectedItem: string
  itemOptions: string[]
  onChange: (value: string) => void
}

export function ItemFilter({ selectedItem, itemOptions, onChange }: ItemFilterProps) {
  return (
    <section className="control-card item-filter-card">
      <h3>Item Filter</h3>
      <p>Search and narrow opportunities by either market currency.</p>
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
