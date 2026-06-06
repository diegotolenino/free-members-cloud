import { getBootstrap } from './bootstrap';

export async function traceCourseBuilder(step, context = {}) {
  try {
    const bootstrap = getBootstrap();

    await fetch(`${bootstrap.restUrl}/debug/trace`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': bootstrap.restNonce || '',
      },
      body: JSON.stringify({
        message: `course-builder:${step}`,
        step,
        context,
      }),
      keepalive: true,
    });
  } catch (error) {
    void error;
  }
}
