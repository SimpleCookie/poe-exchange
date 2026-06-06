interface InvestmentInputsProps {
  chaosBudget: number
  divineBudget: number
  onChaosBudgetChange: (value: number) => void
  onDivineBudgetChange: (value: number) => void
}

export function InvestmentInputs({
  chaosBudget,
  divineBudget,
  onChaosBudgetChange,
  onDivineBudgetChange,
}: InvestmentInputsProps) {
  return (
    <section className="control-card investment-card">
      <h3>Investment Budget</h3>
      <p>Set how much capital you are willing to deploy in each flip.</p>
      <div className="investment-grid">
        <label htmlFor="budget-chaos">
          Chaos
          <input
            id="budget-chaos"
            type="number"
            min={0}
            value={chaosBudget}
            onChange={(event) => onChaosBudgetChange(Math.max(0, Number(event.target.value || 0)))}
          />
        </label>
        <label htmlFor="budget-divine">
          Divine
          <input
            id="budget-divine"
            type="number"
            min={0}
            value={divineBudget}
            onChange={(event) => onDivineBudgetChange(Math.max(0, Number(event.target.value || 0)))}
          />
        </label>
      </div>
    </section>
  )
}
