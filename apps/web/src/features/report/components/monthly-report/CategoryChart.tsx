import { REPORT_CATEGORY_COLOR_CLASS_NAMES } from '@/features/report/constants';
import { normalizePercentages } from '@/features/report/utils/reportChart';

import ReportChartTooltip from './ReportChartTooltip';
import ReportSectionTitle from './ReportSectionTitle';

import type { SpendingCategory } from '@chapchap/shared/common/types';

type Category = {
  category: SpendingCategory;
  percentage: number;
};

type CategoryChartProps = {
  categories: readonly Category[];
};

export default function CategoryChart({ categories }: CategoryChartProps) {
  const normalizedPercentages = normalizePercentages(
    categories.map((category) => category.percentage)
  );
  const normalizedCategories = categories
    .map((category, index) => ({
      ...category,
      percentage: normalizedPercentages[index] ?? 0,
    }))
    .filter((category) => category.percentage > 0);
  const chartLabel = normalizedCategories
    .map((category) => `${category.category} ${category.percentage}%`)
    .join(', ');

  return (
    <section>
      <ReportSectionTitle title="카테고리 분포도" />
      {normalizedCategories.length === 0 ? (
        <p className="mt-3 rounded-lg bg-neutral-50 py-5 text-center text-body-02-medium text-neutral-500">
          카테고리 소비 데이터가 없어요
        </p>
      ) : (
        <>
          <div
            aria-label={`카테고리 분포: ${chartLabel}`}
            className="mt-3 flex h-9.75"
            role="group"
          >
            {normalizedCategories.map((category, index) => {
              const colorClassName = REPORT_CATEGORY_COLOR_CLASS_NAMES[category.category];

              return (
                <button
                  aria-label={`${category.category} ${category.percentage}%`}
                  className="group relative h-full focus-visible:outline-none"
                  key={category.category}
                  style={{ width: `${category.percentage}%` }}
                  type="button"
                >
                  <span
                    aria-hidden
                    className={`absolute inset-0 ${colorClassName} ${index === 0 ? 'rounded-l-lg' : ''} ${index === normalizedCategories.length - 1 ? 'rounded-r-lg' : ''} group-focus-visible:ring-2 group-focus-visible:ring-inset group-focus-visible:ring-neutral-900`}
                  />
                  <ReportChartTooltip
                    alignment={
                      index === 0
                        ? 'start'
                        : index === normalizedCategories.length - 1
                          ? 'end'
                          : 'center'
                    }
                  >
                    {category.category} {category.percentage}%
                  </ReportChartTooltip>
                </button>
              );
            })}
          </div>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-body-02-medium text-neutral-600">
            {normalizedCategories.map((category) => (
              <li className="flex items-center gap-1.5" key={category.category}>
                <span
                  aria-hidden
                  className={`size-5 rounded-full ${REPORT_CATEGORY_COLOR_CLASS_NAMES[category.category]}`}
                />
                {category.category} {category.percentage}%
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
