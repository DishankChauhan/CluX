import CacheManagement from '@/components/CacheManagement';

export default function CachePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Cache & Cost Management</h1>
        <p className="text-gray-600 mt-2">
          Monitor OpenAI API usage, manage cached responses, and track cost savings.
        </p>
      </div>
      
      <CacheManagement />
    </div>
  );
}
