// src/features/identity/components/MyTeamsTableCard.tsx
import React from "react";
import { Users, Shield, Briefcase } from "lucide-react";
import Card from "../../../components/shared/Card";
import Badge from "../../../components/shared/Badge";

interface MyTeamsTableCardProps {
  affiliations: any[];
}

const MyTeamsTableCard = ({ affiliations = [] }: MyTeamsTableCardProps) => {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-6 space-y-4">
        {affiliations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Equipo
                  </th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Puesto en el equipo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {affiliations.map((aff) => (
                  <tr
                    key={aff.id}
                    className="group hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Users size={14} />
                        </div>
                        <span className="text-sm font-bold text-gray-700">
                          {aff.teamName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <Badge
                        variant="indigo"
                        className="!text-[11px] font-black uppercase tracking-tight"
                      >
                        {aff?.teamPosition || "Miembro"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-gray-300 mb-3">
              <Users size={24} />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase italic">
              No apareces en ningún equipo actualmente
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MyTeamsTableCard;
