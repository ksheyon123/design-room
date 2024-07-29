import Link from "next/link";
import { NAV_ITEMS } from "@/constants/index";
import * as styles from "./NavigationView.module.css";
export const NavigationView = () => {
  return (
    <ul className={styles["list-box"]}>
      {NAV_ITEMS.map(({ label, key }) => (
        <li className={styles["list-item"]} key={key}>
          <div className={styles["li-align"]}>
            <Link href={`/physics/${key}`}>{label}</Link>
          </div>
        </li>
      ))}
    </ul>
  );
};
