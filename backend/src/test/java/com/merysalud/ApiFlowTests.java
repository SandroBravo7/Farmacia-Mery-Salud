package com.merysalud;

import com.jayway.jsonpath.JsonPath;
import com.merysalud.entity.Producto;
import com.merysalud.entity.Usuario;
import com.merysalud.repository.DetallePedidoRepository;
import com.merysalud.repository.PedidoRepository;
import com.merysalud.repository.ProductoRepository;
import com.merysalud.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiFlowTests {
    @Autowired MockMvc mvc;
    @Autowired UsuarioRepository users;
    @Autowired ProductoRepository products;
    @Autowired PedidoRepository orders;
    @Autowired DetallePedidoRepository details;
    @Autowired PasswordEncoder encoder;

    @BeforeEach
    void seed() {
        details.deleteAll();
        orders.deleteAll();
        products.deleteAll();
        users.deleteAll();
        user("admin@demo.local", "ClaveAdminSegura1", 1L);
        user("driver@demo.local", "ClaveRepartoSegura1", 2L);
        user("client@demo.local", "ClaveClienteSegura1", 3L);
        Producto product = new Producto();
        product.setNombre("Paracetamol de prueba");
        product.setCategoriaId(1L);
        product.setPresentacion("Caja");
        product.setPrecio(new BigDecimal("12.90"));
        product.setStock(3);
        product.setActivo(true);
        products.save(product);
    }

    private void user(String email, String password, Long role) {
        Usuario user = new Usuario();
        user.setNombre("Usuario de prueba");
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRolId(role);
        user.setActivo(true);
        users.save(user);
    }

    private String token(String email, String password) throws Exception {
        String response = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.token");
    }

    @Test
    void authenticationHashesPasswordsAndRestrictsAdministrativeEndpoint() throws Exception {
        assertTrue(users.findByEmailIgnoreCase("client@demo.local").orElseThrow().getPassword().startsWith("$2"));
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"client@demo.local\",\"password\":\"incorrecta\"}"))
                .andExpect(status().isUnauthorized());
        String client = token("client@demo.local", "ClaveClienteSegura1");
        mvc.perform(post("/api/productos").contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + client).content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/usuarios").header("Authorization", "Bearer " + client))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/usuarios")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/usuarios").header("Authorization", "Bearer invalid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void catalogAndCheckoutUseServerPriceAndUpdateStockAtomically() throws Exception {
        Long id = products.findAll().getFirst().getId();
        mvc.perform(get("/api/productos")).andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Paracetamol de prueba"));
        String client = token("client@demo.local", "ClaveClienteSegura1");
        String request = "{\"clienteNombre\":\"Cliente de prueba\",\"clienteTelefono\":\"987654321\","
                + "\"clienteEmail\":\"client@demo.local\",\"direccionEntrega\":\"Calle Prueba 123\","
                + "\"tipoEntrega\":\"DELIVERY\",\"total\":0.01,\"items\":[{\"id\":" + id + ",\"qty\":2}]}";
        String result = mvc.perform(post("/api/pedidos").header("Authorization", "Bearer " + client)
                .contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isOk()).andExpect(jsonPath("$.total").value(30.8))
                .andExpect(jsonPath("$.items[0].qty").value(2))
                .andReturn().getResponse().getContentAsString();
        assertTrue(JsonPath.read(result, "$.codigoOrden").toString().startsWith("ORD-"));
        assertEquals(1, products.findById(id).orElseThrow().getStock());
        assertEquals(1, orders.count());
        assertEquals(1, details.count());
        mvc.perform(get("/api/pedidos/mios").header("Authorization", "Bearer " + client))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].items[0].name").value("Paracetamol de prueba"));
        mvc.perform(post("/api/pedidos").header("Authorization", "Bearer " + client)
                .contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isConflict());
        assertEquals(1, products.findById(id).orElseThrow().getStock());
    }

    @Test
    void administratorAssignsAndDriverCompletesOwnDelivery() throws Exception {
        Long id = products.findAll().getFirst().getId();
        String client = token("client@demo.local", "ClaveClienteSegura1");
        String admin = token("admin@demo.local", "ClaveAdminSegura1");
        String driver = token("driver@demo.local", "ClaveRepartoSegura1");
        String response = mvc.perform(post("/api/pedidos").header("Authorization", "Bearer " + client)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"clienteNombre\":\"Cliente de prueba\",\"clienteTelefono\":\"987654321\","
                        + "\"clienteEmail\":\"client@demo.local\",\"direccionEntrega\":\"Calle Prueba 123\","
                        + "\"tipoEntrega\":\"DELIVERY\",\"items\":[{\"id\":" + id + ",\"qty\":1}]}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        int orderId = JsonPath.read(response, "$.id");
        Long driverId = users.findByEmailIgnoreCase("driver@demo.local").orElseThrow().getId();
        mvc.perform(put("/api/pedidos/{id}/estado", orderId).header("Authorization", "Bearer " + client)
                .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"ASIGNADO\",\"repartidorId\":" + driverId + "}"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/pedidos/{id}/estado", orderId).header("Authorization", "Bearer " + admin)
                .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"ASIGNADO\",\"repartidorId\":" + driverId + "}"))
                .andExpect(status().isOk());
        mvc.perform(get("/api/pedidos/asignados").header("Authorization", "Bearer " + driver))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].estado").value("ASIGNADO"));
        for (String state : new String[]{"EN_RUTA", "ENTREGADO"}) {
            mvc.perform(put("/api/pedidos/{id}/estado", orderId).header("Authorization", "Bearer " + driver)
                    .contentType(MediaType.APPLICATION_JSON).content("{\"estado\":\"" + state + "\"}"))
                    .andExpect(status().isOk());
        }
        assertEquals("ENTREGADO", orders.findById((long) orderId).orElseThrow().getEstado());
    }
}
