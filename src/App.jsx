import React, { useEffect } from 'react';
import { useCorrespondenceStore } from './store/useCorrespondenceStore';
import { Header } from './components/Header';
import { SidebarQueue } from './components/SidebarQueue';
import { DocumentRenderer } from './components/DocumentRenderer';
import { RoutingModal } from './components/RoutingModal';
import { ArchiveView } from './components/ArchiveView';
import { UploadPortal } from './components/UploadPortal';
import { EmptyState } from './components/EmptyState';
import { Toast } from './components/Toast';
import { CreateCorrespondenceModal } from './components/CreateCorrespondenceModal';
import { AttachPdfModal } from './components/AttachPdfModal';

export function App() {
  const {
    pendingQueue,
    currentId,
    activeView,
    loadQueue,
    isLoading
  } = useCorrespondenceStore();

  useEffect(() => {
    loadQueue();
    useCorrespondenceStore.getState().showToast('مرحباً بك في نظام تهميش وتوجيه المراسلات الإدارية 🏛️', 'info');
  }, []);

  const currentItem = pendingQueue.find((item) => item.id === currentId) || pendingQueue[0];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1A1F2B] font-ibm flex flex-col antialiased selection:bg-[#C8952A]/20 selection:text-[#1B4B8A]">
      {/* Toast Notification Container */}
      <Toast />

      {/* Top Bar Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeView === 'upload' ? (
          <UploadPortal />
        ) : activeView === 'archive' ? (
          <ArchiveView />
        ) : pendingQueue.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Center Main Document Workspace */}
            <DocumentRenderer item={currentItem} readOnly={false} />

            {/* Right Sidebar Queue */}
            <SidebarQueue />
          </div>
        )}
      </main>

      {/* Routing & Signature Modal */}
      <RoutingModal />

      {/* Create New Correspondence Modal */}
      <CreateCorrespondenceModal />

      {/* Attach PDF File Modal for text-only items */}
      <AttachPdfModal />
    </div>
  );
}

export default App;
