-- Normalize labels in tabbed_content.rows to Title Case with spaces
-- Example: maxHeight -> Max Height, AS1530_3 -> As1530 3

with products as (
  select id, tabbed_content
  from public.products
  where tabbed_content is not null
),
tabs as (
  select p.id, t.tab_idx, t.tab
  from products p
  cross join lateral jsonb_array_elements(p.tabbed_content->'tabs') with ordinality as t(tab, tab_idx)
),
cols as (
  select tabs.id, tabs.tab_idx, c.col_idx, c.col, tabs.tab
  from tabs
  cross join lateral jsonb_array_elements(tabs.tab->'columns') with ordinality as c(col, col_idx)
),
secs as (
  select cols.id, cols.tab_idx, cols.col_idx, s.sec_idx, s.sec, cols.col, cols.tab
  from cols
  cross join lateral jsonb_array_elements(cols.col->'sections') with ordinality as s(sec, sec_idx)
),
rows as (
  select secs.id, secs.tab_idx, secs.col_idx, secs.sec_idx, r.row_idx,
    (r.row - 'label') || jsonb_build_object(
      'label', initcap(replace(regexp_replace(coalesce(r.row->>'label',''), '([a-z])([A-Z])', '\1 \2', 'g'), '_', ' '))
    ) as row,
    secs.sec, secs.col, secs.tab
  from secs
  cross join lateral jsonb_array_elements(secs.sec->'rows') with ordinality as r(row, row_idx)
),
sec_rebuilt as (
  select rows.id, rows.tab_idx, rows.col_idx, rows.sec_idx,
    (rows.sec - 'rows') || jsonb_build_object('rows', jsonb_agg(rows.row order by rows.row_idx)) as sec,
    rows.col, rows.tab
  from rows
  group by rows.id, rows.tab_idx, rows.col_idx, rows.sec_idx, rows.sec, rows.col, rows.tab
),
col_rebuilt as (
  select sec_rebuilt.id, sec_rebuilt.tab_idx, sec_rebuilt.col_idx,
    (sec_rebuilt.col - 'sections') || jsonb_build_object('sections', jsonb_agg(sec_rebuilt.sec order by sec_rebuilt.sec_idx)) as col,
    sec_rebuilt.tab
  from sec_rebuilt
  group by sec_rebuilt.id, sec_rebuilt.tab_idx, sec_rebuilt.col_idx, sec_rebuilt.col, sec_rebuilt.tab
),
tab_rebuilt as (
  select col_rebuilt.id, col_rebuilt.tab_idx,
    (tabs.tab - 'columns') || jsonb_build_object('columns', jsonb_agg(col_rebuilt.col order by col_rebuilt.col_idx)) as tab
  from col_rebuilt
  join tabs on tabs.id = col_rebuilt.id and tabs.tab_idx = col_rebuilt.tab_idx
  group by col_rebuilt.id, col_rebuilt.tab_idx, tabs.tab
),
content_rebuilt as (
  select id, jsonb_build_object('tabs', jsonb_agg(tab order by tab_idx)) as new_tabbed
  from tab_rebuilt
  group by id
)
update public.products p
set tabbed_content = content_rebuilt.new_tabbed
from content_rebuilt
where p.id = content_rebuilt.id;

