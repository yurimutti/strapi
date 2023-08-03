import { useFetchClient } from '@strapi/helper-plugin';
import { useQuery } from 'react-query';

export function useReviewWorkflowsStages(contentType) {
  const { kind, uid } = contentType;
  const slug = kind === 'collectionType' ? 'collection-types' : 'single-types';

  const { get } = useFetchClient();

  const { data, isLoading } = useQuery(
    ['content-manager', slug, contentType.uid, 'stages'],
    async () => {
      const {
        data: { data },
      } = await get(`/admin/content-manager/${slug}/${uid}/stages`);

      return data;
    }
  );

  return {
    // meta contains e.g. the total of all workflows. we can not use
    // the pagination object here, because the list is not paginated.
    meta: data?.meta ?? {},
    stages: data ?? [],
    isLoading,
  };
}
