export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-content mx-auto px-6 py-16">
        <h1 className="text-4xl mb-4">BLA Portal</h1>
        <p className="text-text-secondary text-lg mb-8">
          Welcome to the BLA Portal application.
        </p>
        <div className="flex gap-4">
          <button className="bg-accent text-white px-6 py-3 rounded hover:opacity-90 transition-opacity">
            Get Started
          </button>
          <button className="bg-golden text-white px-6 py-3 rounded hover:opacity-90 transition-opacity">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
