import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AccountManager } from "./accounts-manager";
import { EscortManager } from "./escort-manager";
import { HarvestManager } from "./harvests-manager";
import { PlantManager } from "./plants-manager";
import { RecipientManager } from "./recipients-manager";
import { TaskManager } from "./tasks-manager";

export const SuperAdminManagementPanel: React.FC = () => (
  <Card className="bg-white">
    <CardHeader>
      <CardTitle>Panel Manajemen Lapangan</CardTitle>
      <CardDescription>
        Atur seluruh modul operasional lintas wilayah: tugas, penyaluran, progres tanaman, panen, pengawalan, dan akun
        Bhabinkamtibmas.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="flex-wrap">
          <TabsTrigger value="tasks">Tugas Lapangan</TabsTrigger>
          <TabsTrigger value="recipients">Verifikasi Penyaluran</TabsTrigger>
          <TabsTrigger value="plants">Perkembangan Tanaman</TabsTrigger>
          <TabsTrigger value="harvests">Verifikasi Panen</TabsTrigger>
          <TabsTrigger value="escort">Pengawalan</TabsTrigger>
          <TabsTrigger value="accounts">Akun Bhabin</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks">
          <TaskManager />
        </TabsContent>
        <TabsContent value="recipients">
          <RecipientManager />
        </TabsContent>
        <TabsContent value="plants">
          <PlantManager />
        </TabsContent>
        <TabsContent value="harvests">
          <HarvestManager />
        </TabsContent>
        <TabsContent value="escort">
          <EscortManager />
        </TabsContent>
        <TabsContent value="accounts">
          <AccountManager />
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

export default SuperAdminManagementPanel;
