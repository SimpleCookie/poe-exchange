import { useMemo, useState } from 'react'
import './App.css'
import { BackLink } from './components/BackLink'
import { AppHeader } from './components/AppHeader'
import { FlipOpportunitiesTable } from './components/FlipOpportunitiesTable'
import { GameSelector } from './components/GameSelector'
import { InvestmentInputs } from './components/InvestmentInputs'
import { ItemFilter } from './components/ItemFilter'
import { LeagueSelector } from './components/LeagueSelector'
import { StashCurrencies } from './components/StashCurrencies'
import { useExchangeData } from './hooks/useExchangeData'
import { calculateOpportunities } from './lib/exchange/calculateOpportunities'
import { getCurrencyCategory } from './lib/exchange/currencyCategory'

function App() {
  const { game, setGame, leagues, selectedLeague, setSelectedLeague, markets, stash, dataHour, loading, error } = useExchangeData()
  const [itemFilter, setItemFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [chaosBudget, setChaosBudget] = useState(500)
  const [divineBudget, setDivineBudget] = useState(2)

  const itemOptions = useMemo(() => {
    const currencies = new Set<string>()
    for (const market of markets) {
      const [pay, receive] = market.marketId.split('|')
      if (pay) {
        currencies.add(pay)
      }
      if (receive) {
        currencies.add(receive)
      }
    }

    return Array.from(currencies).sort((left, right) => left.localeCompare(right))
  }, [markets])

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>()
    for (const item of itemOptions) {
      categories.add(getCurrencyCategory(item))
    }

    return Array.from(categories).sort((left, right) => left.localeCompare(right))
  }, [itemOptions])

  const allOpportunities = useMemo(
    () => calculateOpportunities(selectedLeague, markets, stash, { chaos: chaosBudget, divine: divineBudget }),
    [selectedLeague, markets, stash, chaosBudget, divineBudget],
  )

  const opportunities = useMemo(() => {
    return allOpportunities.filter((item) => {
      if (categoryFilter) {
        const matchesCategory =
          getCurrencyCategory(item.payCurrency) === categoryFilter ||
          getCurrencyCategory(item.receiveCurrency) === categoryFilter
        if (!matchesCategory) {
          return false
        }
      }

      if (!itemFilter) {
        return true
      }

      const marketLabel = `${item.payCurrency}|${item.receiveCurrency}`.toLowerCase()
      return (
        item.payCurrency.toLowerCase().includes(itemFilter) ||
        item.receiveCurrency.toLowerCase().includes(itemFilter) ||
        marketLabel.includes(itemFilter)
      )
    })
  }, [allOpportunities, itemFilter, categoryFilter])

  return (
    <>
      <BackLink />
      <main className="app">
        <AppHeader />

        <section className="control-grid">
          <GameSelector game={game} onChange={setGame} />

          <LeagueSelector
            leagues={leagues}
            selectedLeague={selectedLeague}
            loading={loading}
            onChange={setSelectedLeague}
          />

          <ItemFilter
            selectedItem={itemFilter}
            itemOptions={itemOptions}
            onChange={setItemFilter}
            selectedCategory={categoryFilter}
            categoryOptions={categoryOptions}
            onCategoryChange={setCategoryFilter}
          />

          <InvestmentInputs
            chaosBudget={chaosBudget}
            divineBudget={divineBudget}
            onChaosBudgetChange={setChaosBudget}
            onDivineBudgetChange={setDivineBudget}
          />
        </section>

        {error ? <p className="error">{error}</p> : null}

        <StashCurrencies stash={stash} />

        <FlipOpportunitiesTable
          loading={loading}
          opportunities={opportunities}
          dataHour={dataHour}
          league={selectedLeague}
          game={game}
        />
      </main>
    </>
  )
}

export default App
