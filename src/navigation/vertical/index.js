
import getDashboardMenu from "./dashboard"
import getAppAndPagesMenu from "./apps-and-pages"

export default async function getFullMenu() {
  const useAppAndPages = await getAppAndPagesMenu()
  const useDashboardMenu = await getDashboardMenu()

  return [
    ...useDashboardMenu,
    ...useAppAndPages,
  ]
}
