import { logger } from '../utils/logger.js';

export interface ReplitInfo {
  isReplit: boolean;
  replId?: string;
  replSlug?: string;
  replOwner?: string;
  publicUrl?: string;
}

export function getReplitInfo(): ReplitInfo {
  const isReplit = process.env.REPL_ID !== undefined;
  
  if (!isReplit) {
    return { isReplit: false };
  }

  const replSlug = process.env.REPL_SLUG;
  const replOwner = process.env.REPL_OWNER;
  
  // Replit URL format: https://{slug}.{owner}.repl.co
  const publicUrl = replSlug && replOwner 
    ? `https://${replSlug}.${replOwner}.repl.co`
    : undefined;

  return {
    isReplit: true,
    replId: process.env.REPL_ID,
    replSlug,
    replOwner,
    publicUrl,
  };
}

export function setupReplitKeepAlive(port: number): void {
  const replitInfo = getReplitInfo();
  
  if (!replitInfo.isReplit || !replitInfo.publicUrl) {
    logger.info('Not running on Replit, skip keep-alive setup');
    return;
  }

  // Self-ping every 5 minutes to prevent Replit sleep
  const keepAliveUrl = `${replitInfo.publicUrl}/health`;
  
  setInterval(async () => {
    try {
      const response = await fetch(keepAliveUrl);
      if (response.ok) {
        logger.debug(`✅ Keep-alive ping successful`);
      } else {
        logger.warn(`⚠️  Keep-alive ping failed: ${response.status}`);
      }
    } catch (error) {
      logger.error('❌ Keep-alive error:', error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  logger.info(`🔄 Replit keep-alive enabled: ${keepAliveUrl}`);
}

export function logReplitEnvironment(): void {
  const info = getReplitInfo();
  
  if (info.isReplit) {
    logger.info('🔷 Running on Replit');
    logger.info(`   Repl ID: ${info.replId}`);
    logger.info(`   Public URL: ${info.publicUrl}`);
  } else {
    logger.info('💻 Running locally');
  }
}