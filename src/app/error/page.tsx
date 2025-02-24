'use client';

export default function ErrorPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(/gradient.svg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-green-100 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-green-700 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-8">Something went wrong on our end.</p>
        </div>
        <p className="text-sm text-gray-500">
          If the problem persists, please try again later.
        </p>
      </div>
    </div>
  );
}
