use serialport;
use std::time::Duration;

// 1. Lister les ports COM
#[tauri::command]
fn list_ports() -> Vec<String> {
    match serialport::available_ports() {
        Ok(ports) => ports.iter().map(|p| p.port_name.clone()).collect(),
        Err(_) => vec![],
    }
}

// Fonction de validation (Handshake)
#[tauri::command]
async fn check_port(port_name: String) -> Result<bool, String> {
    let mut port = serialport::new(port_name, 115200)
        .timeout(Duration::from_millis(1000)) // On attend max 1s
        .open()
        .map_err(|e| e.to_string())?;

    // On vide le buffer d'entrée au cas où
    let _ = port.clear(serialport::ClearBuffer::Input);

    // On envoie le code secret
    port.write_all(b"CHECK\n").map_err(|e| e.to_string())?;

    // On lit la réponse
    let mut buffer: [u8; 1] = [0; 1];
    match port.read_exact(&mut buffer) {
        Ok(()) => {
            let char_received = buffer[0] as char;
            println!("Caractère reçu : {}", char_received);
            Ok(char_received == '!')
        }
        Err(_) => Ok(false),
    }
}

// 2. Envoyer la commande DMX
#[tauri::command]
fn send_dmx(port_name: String, canal: u16, valeur: u8) -> Result<(), String> {
    let mut port = serialport::new(port_name, 115200)
        .timeout(Duration::from_millis(10))
        .open()
        .map_err(|e| e.to_string())?;

    let data = format!("{},{}\n", canal, valeur);
    port.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![list_ports, check_port, send_dmx])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
