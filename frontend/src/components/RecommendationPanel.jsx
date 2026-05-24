export default function RecommendationPanel({ title = 'AI Recommendations', recommendations = [] }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {recommendations.length ? (
          recommendations.map((item) => (
            <li key={item} className="rounded-lg bg-slate-50 p-2">
              {item}
            </li>
          ))
        ) : (
          <li className="text-slate-500">No recommendations yet.</li>
        )}
      </ul>
    </section>
  );
}
