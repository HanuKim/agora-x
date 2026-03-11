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
    mapToContentCategory,
} from './types';
export { CONTENT_CATEGORIES } from '../common/types';
export type { KnowledgeLevel, UserKnowledgePrefs } from './types';
export type { ContentCategory } from '../common/types';
