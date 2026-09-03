import DatabaseStudioClient from "../../components/database-studio/DatabaseStudioClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database Studio | Edition TV",
  description: "Internal Database Studio",
};

export default function DatabaseStudioPage() {
  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
      <DatabaseStudioClient />
    </div>
  );
}
