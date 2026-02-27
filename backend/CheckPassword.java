import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class CheckPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123";
        String encodedPassword = "$2a$10$7QEMiElHzGlm0EzBX9qN7.LRr5l3c6u9Hkh1UZBgflC3WfD/Bq4S6";
        boolean matches = encoder.matches(rawPassword, encodedPassword);
        System.out.println("Matches: " + matches);
        
        System.out.println("New Hash: " + encoder.encode(rawPassword));
    }
}
