import { Button } from "@/components/ui/button";


function App() {
  return (
    <>
      <section className="bg-white dark:bg-gray-900 p-10 n-10">
        <h1 className="text-3xl font-bold underline">Empezando el proyecto</h1>
        <p>
          Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
        </p>
        <button type="button" className="counter"></button>
      </section>

      <div className="flex gap-2 p-10 n-10 ">
      <Button onClick={() => alert(`el boton funciona`)} className= "rounded-full">Probar botón</Button>
      <Button variant="destructive">Secundario</Button>
      </div>
    </>
  )
}

export default App
