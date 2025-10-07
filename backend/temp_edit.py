from pathlib import Path
path = Path(r"src/repositories/bhabin-repository.ts")
text = path.read_text(encoding="utf-8")
segment = "      nama: payload.nama ? payload.nama.trim() : current.nama,\n      email: nextEmail,\n      agency: payload.agency?.trim() ?? current.agency,\n      wilayah: payload.wilayah?.trim() ?? current.wilayah,\n      phone: payload.phone?.trim() ?? current.phone,\n      status: payload.status ?? current.status,\n      password: payload.password?.trim() || current.password,\n"
replacement = "      nama: payload.nama ? payload.nama.trim() : current.nama,\n      email: nextEmail,\n      agency: payload.agency is not None and payload.agency is not None\n"
