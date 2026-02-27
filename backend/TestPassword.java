import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = "$2a$10$7QEMiElHzGlm0EzBX9qN7.LRr5l3c6u9Hkh1UZBgflC3WfD/Bq4S6";
        
        System.out.println("Testando senhas contra o hash do banco...\n");
        
        // Testar várias senhas
        test(encoder, hash, "admin123");
        test(encoder, hash, "senha123");
        test(encoder, hash, "admin");
        test(encoder, hash, "trinca123");
        test(encoder, hash, "password");
        
        System.out.println("\n--- Gerando novo hash para 'admin123' ---");
        String newHash = encoder.encode("admin123");
        System.out.println("Novo hash: " + newHash);
        System.out.println("Teste: " + encoder.matches("admin123", newHash));
    }
    
    static void test(BCryptPasswordEncoder encoder, String hash, String password) {
        boolean matches = encoder.matches(password, hash);
        System.out.println((matches ? "✅" : "❌") + " Senha '" + password + "': " + matches);
    }
}
