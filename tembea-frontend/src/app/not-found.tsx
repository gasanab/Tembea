import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section-pad">
      <div className="tembea-container dashboard-card stack-md p-8 text-center">
        <h1 className="text-4xl font-black">Page not found</h1>
        <p className="text-muted">This Tembea route is not available yet.</p>
        <Link className="btn-base btn-dark mx-auto" href="/">
          Go home
        </Link>
      </div>
    </main>
  );
}
