import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface RouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    route: RouteData | null;
    selectedGudang: GudangData | null;
    warehouseInfo: {
        distance: number;
        direction: string;
    } | null;
}

interface RouteInstruction {
    text: string;
    distance: number;
    duration: number;
}

interface RouteData {
    coordinates: number[][];
    distance: number;
    duration: number;
    instructions: RouteInstruction[];
}

interface GudangData {
    id: string;
    nama: string;
    lokasi: number[];
}

const RouteModal = ({
    isOpen,
    onClose,
    route,
    selectedGudang,
    warehouseInfo
}: RouteModalProps) => {
    if (!route || !selectedGudang) return null;

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <div className="relative z-[2000]">
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-emerald-700/70">
                                🚚 Informasi Rute ke {selectedGudang.nama}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-4 top-4"
                                onClick={() => onClose()}
                            >
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div className="mb-6">
                            <p className="text-lg">
                                <span className="font-semibold">📍 Total Jarak:</span>{' '}
                                {route.distance.toFixed(2)} km
                            </p>
                            <p className="text-lg">
                                <span className="font-semibold">⏱️ Total Waktu:</span>{' '}
                                {Math.round(route.duration)} menit
                            </p>
                            <p className="text-lg">
                                <span className="font-semibold">🧭 Arah:</span>{' '}
                                {warehouseInfo?.direction}
                            </p>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="text-xl font-semibold mb-4">Petunjuk Arah:</h4>
                            <div className="space-y-3">
                                {route.instructions.map((instruction: RouteInstruction, index: number) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-medium">
                                            {index + 1}. {instruction.text}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {instruction.distance.toFixed(2)} km • {Math.round(instruction.duration)} menit
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </div>
        </Dialog>
    );
};



export default RouteModal