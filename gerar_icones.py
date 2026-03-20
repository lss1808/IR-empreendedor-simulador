"""
Gera os ícones do PWA (192x192 e 512x512) sem dependências externas.
Requer apenas Python 3 padrão.
Execute: python3 gerar_icones.py
"""
import os, struct, zlib, base64

def make_png(size):
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)

    # Cor de fundo: #1a3a2a (verde escuro)
    bg = (0x1a, 0x3a, 0x2a)
    # Cor do texto/ícone: branco
    fg = (0xff, 0xff, 0xff)

    # Cria pixels RGBA
    pixels = []
    cx, cy = size // 2, size // 2
    r_outer = int(size * 0.45)
    r_inner = int(size * 0.30)

    for y in range(size):
        row = []
        for x in range(size):
            dx, dy = x - cx, y - cy
            dist = (dx*dx + dy*dy) ** 0.5
            # Círculo externo
            if dist <= r_outer:
                if dist >= r_inner:
                    # Borda branca
                    row += list(fg) + [255]
                else:
                    # Interior verde
                    row += list(bg) + [255]
            else:
                row += list(bg) + [255]
        pixels.append(row)

    # Desenha "R$" simplificado como linhas brancas no centro
    line_w = max(2, size // 40)
    for y in range(size):
        for x in range(size):
            # Linha horizontal centro
            if abs(y - cy) < line_w and abs(x - cx) < r_inner * 0.6:
                pixels[y][x*4:x*4+4] = list(fg) + [255]
            # Linha vertical esquerda do "R"
            if abs(x - (cx - r_inner//4)) < line_w and abs(y - cy) < r_inner * 0.5:
                pixels[y][x*4:x*4+4] = list(fg) + [255]

    # Flatten
    raw = b''
    for row in pixels:
        raw += b'\x00' + bytes(row)

    compressed = zlib.compress(raw, 9)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    png = (
        b'\x89PNG\r\n\x1a\n' +
        chunk(b'IHDR', ihdr) +
        chunk(b'IDAT', compressed) +
        chunk(b'IEND', b'')
    )
    return png

os.makedirs('icons', exist_ok=True)
for sz in [192, 512]:
    data = make_png(sz)
    path = f'icons/icon-{sz}.png'
    with open(path, 'wb') as f:
        f.write(data)
    print(f'✅ {path} gerado ({len(data)} bytes)')

print('\nÍcones prontos! Agora rode o app com Live Server.')
