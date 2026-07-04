export default function SectionTitle({ eyebrow, title, description, action, inverse = false }) {
  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={`mb-2 text-xs font-bold uppercase tracking-widest ${inverse ? 'text-gray-300' : 'text-gray-400'}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`text-3xl font-black tracking-tight md:text-4xl ${inverse ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          {title}
        </h2>
        {description && (
          <p className={`mt-3 leading-relaxed ${inverse ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
