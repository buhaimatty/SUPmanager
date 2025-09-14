import Header from "./components/Header";
import Home from "./components/Home";
import AddSuperhero from "./components/AddSuperhero";
import SuperheroList from "./components/SuperheroList";
import TransitionButton from "./components/helpers/TransitionButton.jsx";
import { useEffect, useState } from "react";
import { listSuperheroes, deleteSuperhero } from "./lib/superheroesClient";
import EditSuperhero from "./components/EditSuperhero";

function App() {
  const pageSize = 5;
  const [page, setPage] = useState(1);
  const [heroes, setHeroes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  // Fetch a page of heroes from server and update list UI.
  async function load(p = page) {
    setLoading(true);
    try {
      const data = await listSuperheroes({ page: p, pageSize });
      setHeroes(data.items);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }

  // Load whenever the current 'page' changes (including first mount: page=1).
  useEffect(() => {
    load(page);
  }, [page]);

  // After a successful create: jump to page 1 and let the useEffect load it.
  async function handleCreated() {
    setPage(1);
  }

  // Delete handler invoked from the list (receives full hero object)
  async function handleDelete(hero) {
    if (!confirm(`Delete “${hero.nickname}”?`)) return; // later: fancy tost UI
    await deleteSuperhero(hero.id);

    // Re-query the current page to reflect removal
    const data = await listSuperheroes({ page, pageSize });

    // If page became empty and user isn't on the first page -> go back one page.
    // The useEffect will fetch that previous page.
    if (data.items.length === 0 && page > 1) {
      setPage(page - 1); // useEffect will call load()
    } else {
      setHeroes(data.items);
      setTotalPages(data.totalPages);
    }
  }

  // When user clicks "edit" on an item, open modal
  function handleEdit(hero) {
    setEditing(hero.id);
  }

  // After save: refresh current page and close modal
  async function handleSaved() {
    await load(page);
    setEditing(null);
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <div className="w-full mb-32">
          <Header />
        </div>

        <section id="home" className="pt-4 pb-9 scroll-mt-34">
          <Home />
        </section>

        <section id="addHero" className="w-full mt-5 scroll-mt-32">
          <AddSuperhero onCreated={handleCreated} />
        </section>

        <div className="my-28">
          <TransitionButton href="#library" text="Go to Library" />
        </div>

        <section
          id="library"
          className="w-full max-w-3xl px-6 mb-8 scroll-mt-30"
        >
          {loading && (
            <div className="text-sm text-zinc-500 mb-2">Loading…</div>
          )}
          <SuperheroList
            items={heroes}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        </section>

        {editing != null && (
          <EditSuperhero
            id={editing}
            onClose={() => setEditing(null)}
            onSaved={handleSaved}
          />
        )}
      </div>
    </div>
  );
}

export default App;
