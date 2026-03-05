/**
 * features/user public API barrel
 *
 * 외부에서는 항상 이 barrel을 통해 import 합니다:
 * import { UserPrefsProvider, useUserPrefs, ... } from '@/features/user'
 */

export { UserPrefsProvider, UserPrefsContext } from './context/UserPrefsContext';
export type { UserPrefsContextType } from './context/UserPrefsContext';
export { useUserPrefs } from './hooks/useUserPrefs';
export {
    DEFAULT_KNOWLEDGE_PREFS,
    KNOWLEDGE_LEVEL_LABELS,
    CONTENT_CATEGORIES,
    mapToContentCategory,
} from './types';
export type { KnowledgeLevel, ContentCategory, UserKnowledgePrefs } from './types';
