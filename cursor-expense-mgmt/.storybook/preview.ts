import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';
// Mock fetch globally for Storybook
if (typeof window !== 'undefined' && !(window as any).fetch) {
  (window as any).fetch = async (url: string) => {
    // Default mock - stories can override this
    return Promise.resolve({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
  };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
